import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, FeatureGroup, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { EditControl } from 'react-leaflet-draw';
import L, { LatLngLiteral } from 'leaflet';

declare module 'leaflet' {
  namespace DrawEvents {
    interface Created extends L.LeafletEvent {
      layerType: string;
      layer: L.Layer;
    }

    interface Edited extends L.LeafletEvent {
      layers: L.LayerGroup;
    }

    interface Deleted extends L.LeafletEvent {
      layers: L.LayerGroup;
    }
  }
}

type PolygonCoords = LatLngLiteral[][];

const defaultPolygon: LatLngLiteral[][] = [
  [
    { lat: 51.505, lng: -0.09 },
    { lat: 51.51, lng: -0.1 },
    { lat: 51.51, lng: -0.12 },
    { lat: 51.505, lng: -0.09 },
  ],
];

const MapWithDraw: React.FC = () => {
    const [isMounted, setIsMounted] = useState<boolean>(false);
  const [polygons, setPolygons] = useState<PolygonCoords>([]);
  const featureGroupRef = useRef<L.FeatureGroup>(null);


  const _onCreate = (e: L.DrawEvents.Created) => {
    console.log('ss');
    const { layerType, layer } = e;
    if (layerType === 'polygon') {
      const newPolygon = (
        layer as L.Polygon
      ).getLatLngs()[0] as LatLngLiteral[];

      // console.log(newPolygon?.map((el) => ({lat: el.lat, lng: el.lng})))
      setPolygons((prev) => [...prev, newPolygon]);
    }
  };

  const _onDeleted = (e: L.DrawEvents.Deleted) => {
    console.log('deleted');
    const layers = e.layers;
    layers.eachLayer((layer) => {
      const layerPolygon = (
        layer as L.Polygon
      ).getLatLngs()[0] as LatLngLiteral[];
      setPolygons((prev) =>
        prev.filter(
          (polygon) => JSON.stringify(polygon) !== JSON.stringify(layerPolygon)
        )
      );
    });
  };

  const _onEdited = (e: L.DrawEvents.Edited) => {
    console.log('edited');
    const layers = e.layers;
    layers.eachLayer((layer) => {
      const editedPolygon = (
        layer as L.Polygon
      ).getLatLngs()[0] as LatLngLiteral[];
      setPolygons((prevPolygons) =>
        prevPolygons.map((polygon) =>
          JSON.stringify(polygon) === JSON.stringify(editedPolygon)
            ? editedPolygon
            : polygon
        )
      );
    });
  };

  useEffect(() => {
    if (featureGroupRef.current && isMounted) {
        console.log('nn')
        setPolygons((prev) => [
            ...defaultPolygon.map((polygon) =>
              polygon.map(({ lat, lng }) => L.latLng(lat, lng))
            ),
          ]);
      const fg = featureGroupRef.current;
      // Add default polygon to the feature group so it can be managed by Leaflet Draw
      const defaultLayer = L.polygon(defaultPolygon[0]);
      fg.addLayer(defaultLayer);
    }
  }, [isMounted, featureGroupRef]);

  
//   React.useEffect(() => {
//     if (featureGroupRef.current?.getLayers().length === 0 && isMounted ) {
//         setPolygons((prev) => [
//             ...defaultPolygon.map((polygon) =>
//               polygon.map(({ lat, lng }) => L.latLng(lat, lng))
//             ),
//           ]);
//     }
//   }, [isMounted]);

  console.log('pol', polygons);

  return (
    <MapContainer
      center={[51.505, -0.09]}
      zoom={13}
      style={{ height: '500px', width: '100%' }}
    >
      <TileLayer
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        // attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      <FeatureGroup ref={featureGroupRef} >
        <EditControl
          position='topright'
          onMounted={() => setIsMounted(true)}
          onCreated={_onCreate}
          onDeleted={_onDeleted}
          onEdited={_onEdited}
          draw={{
            rectangle: false,
            polyline: false,
            circle: false,
            marker: false,
            circlemarker: false,
          }}
         key={polygons?.join('/')} 
        />
      </FeatureGroup>

      {/* Render all polygons */}
      {polygons.map((polygon, index) => (
        <Polygon key={index} positions={polygon} />
      ))}
    </MapContainer>
  );
};

export default MapWithDraw;
