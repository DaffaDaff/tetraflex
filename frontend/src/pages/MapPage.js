import React, { useEffect, useRef, useState, } from 'react';
import { useNavigate } from 'react-router-dom';
import 'maplibre-gl/dist/maplibre-gl.css';
import maplibregl from 'maplibre-gl';
import * as THREE from "three";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import { Drawer, Button, Typography, Box, CircularProgress, List, ListItem } from "@mui/material";
import axios from 'axios';

const MAPTILER_API_KEY = 'eTbxwE6QCBy7MximlZtG';
const MAPTILER_STYLE_URL = `https://api.maptiler.com/maps/streets/style.json?key=${MAPTILER_API_KEY}`;
const API_BASE_URL = 'http://localhost:5000';

function MapPage() {
  const navigate = useNavigate();

  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef({}); // Reference to store markers, not state
  const [markers, setMarkers] = useState([]); // React state to re-render UI when markers change
  const models = useRef({});

  const [openDrawer, setOpenDrawer] = useState(false);
  const [userInfo, setUserInfo] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
      navigate('/login');
    }

    if (!map.current && mapContainer.current) {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: MAPTILER_STYLE_URL,
        center: [0, 0],
        zoom: 2,
        pitch: 60, 
        antialias: true,
      });

      map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

      // Wait for the map to load completely before interacting with it
      map.current.on('load', () => {
        //console.log('Map loaded!');
        fetchMarkers(); // Fetch markers after the map is loaded
        const interval = setInterval(fetchMarkers, 5000); // Poll every 5 seconds

        return () => clearInterval(interval); // Cleanup on unmount
      });

      // Re-center map after moving (panning or zooming)
      map.current.on('moveend', () => {
        const center = map.current.getCenter();
        //console.log('Map centered at:', center);
        // Optional: Add logic to handle zoom changes if necessary
      });
    }
  }, []);

  const fetchMarkers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/new_entries`);
      const data = await response.json();

      // New markers array to be set in state
      const newMarkers = [];

      // Track markers on map (inside markersRef)
      data.forEach((entry) => {
        if (!markersRef.current[entry.DbId]) {
          add3DMarker(entry.latitude, entry.longitude, entry.DbId);
          // If marker is not on the map already, add it
          const marker = new maplibregl.Marker()
            .setLngLat([entry.longitude, entry.latitude])
            .addTo(map.current);

          marker.getElement().addEventListener('click', () => {
            fetchUserInfo(entry.DbId);
            setOpenDrawer(true);

            setTimeout(() => {
              document
                .getElementById(`delete-marker`)
                ?.addEventListener('click', async () => {
                  await deleteMarker(entry.DbId);
                  marker.remove();
                  delete markersRef.current[entry.DbId]; // Remove from map tracking
                  setMarkers((prevMarkers) => prevMarkers.filter((m) => m.id !== entry.DbId)); // Remove from state
                });
            }, 100);
          });

          // Store marker in markersRef for reference
          markersRef.current[entry.DbId] = marker;
          newMarkers.push({ id: entry.DbId, longitude: entry.longitude, latitude: entry.latitude });
        }
      });

      setMarkers(newMarkers); // Update React state with new markers

      // If new marker exists, re-center map to the new marker's location
      if (newMarkers.length > 0) {
        const latestMarker = newMarkers[newMarkers.length - 1];
        if (map.current) {
          map.current.setCenter([latestMarker.longitude, latestMarker.latitude]);
        }
      }
    } catch (error) {
      console.error('Error fetching markers:', error);
    }
  };

  const fetchUserInfo = async (id) => {
    setLoading(true);
    try{
      const response = await axios.get(`${API_BASE_URL}/get-detail/${id}`);
      response.data[0].id = id
      setUserInfo(response.data[0]);
    } catch (error) {
      console.error('Error fetching user info', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteMarker = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/new_entries`);
      const data = await response.json();

      data.forEach((entry) => {
        if (entry.DbId == id) {
          map.current.removeLayer(`${entry.longitude}, ${entry.latitude}`);
        }
      });

      await fetch(`${API_BASE_URL}/delete/${id}`, { method: 'DELETE' });
    } catch (error) {
      console.error('Error deleting marker:', error);
    } finally {
      setOpenDrawer(false);
    }
  };

  const add3DMarker = (latitude, longitude, DbId) => {
    // parameters to ensure the model is georeferenced correctly on the map
    const modelOrigin = [longitude, latitude];
    const modelAltitude = 0;
    const modelRotate = [Math.PI / 2, 0, 0];

    const modelAsMercatorCoordinate = maplibregl.MercatorCoordinate.fromLngLat(
        modelOrigin,
        modelAltitude
    );

    // transformation parameters to position, rotate and scale the 3D model onto the map
    const modelTransform = {
        translateX: modelAsMercatorCoordinate.x,
        translateY: modelAsMercatorCoordinate.y,
        translateZ: modelAsMercatorCoordinate.z,
        rotateX: modelRotate[0],
        rotateY: modelRotate[1],
        rotateZ: modelRotate[2],
        /* Since our 3D model is in real world meters, a scale transform needs to be
        * applied since the CustomLayerInterface expects units in MercatorCoordinates.
        */
        scale: modelAsMercatorCoordinate.meterInMercatorCoordinateUnits()
    };


    // configuration of the custom layer for a 3D model per the CustomLayerInterface
    const customLayer = {
        id: `${longitude}, ${latitude}`,
        type: 'custom',
        renderingMode: '3d',
        onAdd (map, gl) {
            this.camera = new THREE.Camera();
            this.scene = new THREE.Scene();

            // create two three.js lights to illuminate the model
            const directionalLight = new THREE.DirectionalLight(0xffffff);
            directionalLight.position.set(0, -70, 100).normalize();
            this.scene.add(directionalLight);

            const directionalLight2 = new THREE.DirectionalLight(0xffffff);
            directionalLight2.position.set(0, 70, 100).normalize();
            this.scene.add(directionalLight2);

            // use the three.js GLTF loader to add the 3D model to the three.js scene
            const loader = new GLTFLoader();
            loader.load(
                '/models/wave.gltf',
                (gltf) => {
                    this.scene.add(gltf.scene);
                    this.model = gltf.scene;

                    this.mixer = new THREE.AnimationMixer(gltf.scene);
                    gltf.animations.forEach((clip) => {
                        this.mixer.clipAction(clip).play(); // Play all animations from the GLTF file
                    });
                }
            );
            this.map = map;

            // use the MapLibre GL JS map canvas for three.js
            this.renderer = new THREE.WebGLRenderer({
                canvas: map.getCanvas(),
                context: gl,
                antialias: true
            });

            this.renderer.autoClear = false;

            this.animate();
        },
        render (gl, args) {
            const rotationX = new THREE.Matrix4().makeRotationAxis(
                new THREE.Vector3(1, 0, 0),
                modelTransform.rotateX
            );
            const rotationY = new THREE.Matrix4().makeRotationAxis(
                new THREE.Vector3(0, 1, 0),
                modelTransform.rotateY
            );
            const rotationZ = new THREE.Matrix4().makeRotationAxis(
                new THREE.Vector3(0, 0, 1),
                modelTransform.rotateZ
            );

            const m = new THREE.Matrix4().fromArray(args.defaultProjectionData.mainMatrix);
            const l = new THREE.Matrix4()
                .makeTranslation(
                    modelTransform.translateX,
                    modelTransform.translateY,
                    modelTransform.translateZ
                )
                .scale(
                    new THREE.Vector3(
                        modelTransform.scale,
                        -modelTransform.scale,
                        modelTransform.scale
                    )
                )
                .multiply(rotationX)
                .multiply(rotationY)
                .multiply(rotationZ);

            // Alternatively, you can use this API to get the correct model matrix.
            // It will work regardless of current projection.
            // Also see the example "globe-3d-model.html".
            //
            // const modelMatrix = args.getMatrixForModel(modelOrigin, modelAltitude);
            // const m = new THREE.Matrix4().fromArray(matrix);
            // const l = new THREE.Matrix4().fromArray(modelMatrix);

            this.camera.projectionMatrix = m.multiply(l);
            this.renderer.resetState();
            this.renderer.render(this.scene, this.camera);
            this.map.triggerRepaint();
        },
        animate() {
          if (this.model) {
              // this.model.scale.x += 0.01;
              // this.model.scale.z += 0.01;
          }
          if (this.mixer){
            this.mixer.update(0.016);
          }

          // Call the animate method again for the next frame
          requestAnimationFrame(this.animate.bind(this));
      }
    };
  
    map.current.addLayer(customLayer);
  };
  
  return (
    <div>
      <div ref={mapContainer} style={{ width: '100%', height: '100vh' }} />

      <Drawer 
        anchor="left" 
        open={openDrawer} 
        onClose={() => setOpenDrawer(false)}
        ModalProps={{
          BackdropProps: { style: { backgroundColor: "transparent" } },
        }}
      >
        <Box sx={{ width: 300, p: 3 }}>
          <Typography variant="h5" gutterBottom>
            User Information
          </Typography>
          {loading ? (
            <CircularProgress />
          ) : userInfo ? (
            <>
              <Box
                component="img"
                sx={{
                  height: 150,
                  width: 150,
                  borderRadius: '50%',
                }}
                alt="Profile Picture"
                src={require("../assets/blank_profile.png")}
              />
              <Typography><strong>Name:</strong> {userInfo.username}</Typography>
              <Typography><strong>Email:</strong> {userInfo.email}</Typography>
              <Typography><strong>No ISSI:</strong> 123456789</Typography>
              <Typography><strong>Dept.:</strong> </Typography>
              <Typography><strong>Riwayat Panggilan Emergency:</strong></Typography>
              <List disablePadding>
                <ListItem disablePadding>1. 15/02/2025</ListItem>
                <ListItem disablePadding>2. 03/03/2025</ListItem>
                <ListItem disablePadding>3. 12/03/2025</ListItem>
              </List>
              <Button 
                id="delete-marker"
                variant="contained" 
                color="secondary" 
                sx={{ mt: 2 }}
              >
                Remove
              </Button>
            </>
            ) : (
              <Typography>No user data found.</Typography>
            )}

        </Box>
      </Drawer>
    </div>
  );
}

export default MapPage;
