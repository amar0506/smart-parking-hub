import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Box, Plane } from "@react-three/drei";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ParkingCircle } from "lucide-react";
import * as THREE from "three";

// A single car mesh
function CarModel({ position, color }: { position: [number, number, number]; color: string }) {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.02;
    }
  });

  return (
    <group ref={ref} position={position}>
      {/* Car body */}
      <Box args={[0.8, 0.3, 0.4]} position={[0, 0.15, 0]}>
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
      </Box>
      {/* Car roof */}
      <Box args={[0.5, 0.2, 0.35]} position={[0.05, 0.35, 0]}>
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
      </Box>
      {/* Wheels */}
      {[[-0.25, 0, 0.2], [-0.25, 0, -0.2], [0.25, 0, 0.2], [0.25, 0, -0.2]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <cylinderGeometry args={[0.06, 0.06, 0.05, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      ))}
    </group>
  );
}

// A parking slot
function ParkingSlot({ position, occupied, label }: { position: [number, number, number]; occupied: boolean; label: string }) {
  return (
    <group position={position}>
      {/* Slot floor marking */}
      <Plane args={[0.9, 0.5]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <meshStandardMaterial color={occupied ? "#ef4444" : "#22c55e"} opacity={0.3} transparent />
      </Plane>
      {/* Slot border lines */}
      <Box args={[0.02, 0.02, 0.5]} position={[-0.45, 0.01, 0]}>
        <meshStandardMaterial color="#ffffff" opacity={0.6} transparent />
      </Box>
      <Box args={[0.02, 0.02, 0.5]} position={[0.45, 0.01, 0]}>
        <meshStandardMaterial color="#ffffff" opacity={0.6} transparent />
      </Box>
      {/* Label */}
      <Text position={[0, 0.02, 0.3]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.1} color={occupied ? "#ef4444" : "#22c55e"}>
        {label}
      </Text>
      {/* Car if occupied */}
      {occupied && <CarModel position={[0, 0, 0]} color={["#3b82f6", "#ef4444", "#8b5cf6", "#f59e0b", "#06b6d4"][Math.floor(Math.random() * 5)]} />}
    </group>
  );
}

// Moving car animation
function MovingCar() {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime;
      ref.current.position.x = Math.sin(t * 0.5) * 4;
      ref.current.position.z = Math.cos(t * 0.5) * 2 + 3;
      ref.current.rotation.y = Math.atan2(Math.cos(t * 0.5) * 0.5, -Math.sin(t * 0.5) * 2);
    }
  });

  return (
    <group ref={ref}>
      <CarModel position={[0, 0, 0]} color="#f59e0b" />
    </group>
  );
}

// Parking lot scene
function ParkingLotScene() {
  const slots = [];
  // Generate 2 rows of 6 slots
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 6; col++) {
      const occupied = Math.random() > 0.4;
      slots.push({
        position: [col * 1.1 - 2.75, 0, row * 1.2 - 0.6] as [number, number, number],
        occupied,
        label: `${String.fromCharCode(65 + row)}${col + 1}`,
      });
    }
  }

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 8, 5]} intensity={1} castShadow />
      <pointLight position={[-3, 4, -3]} intensity={0.5} color="#3b82f6" />

      {/* Ground */}
      <Plane args={[12, 8]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#374151" />
      </Plane>

      {/* Road markings */}
      <Box args={[8, 0.01, 0.3]} position={[0, 0.005, 1.2]}>
        <meshStandardMaterial color="#6b7280" />
      </Box>

      {/* Parking slots */}
      {slots.map((slot, i) => (
        <ParkingSlot key={i} position={slot.position} occupied={slot.occupied} label={slot.label} />
      ))}

      {/* Moving car */}
      <MovingCar />

      {/* Title text */}
      <Text position={[0, 2.5, -2]} fontSize={0.3} color="#3b82f6" font={undefined}>
        SmartPark - Satna
      </Text>

      <OrbitControls enablePan enableZoom enableRotate maxPolarAngle={Math.PI / 2.2} minDistance={3} maxDistance={12} />
    </>
  );
}

export default function Parking3DPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ParkingCircle className="h-6 w-6 text-primary" /> 3D Parking Visualization
          </h1>
          <p className="text-muted-foreground">Interactive 3D view of the parking lot with real-time slot status</p>
        </div>

        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="h-[600px] bg-foreground/5">
              <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
                <ParkingLotScene />
              </Canvas>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-3 gap-4">
          <Card className="text-center p-4">
            <div className="w-4 h-4 rounded-full bg-accent mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">Available</p>
          </Card>
          <Card className="text-center p-4">
            <div className="w-4 h-4 rounded-full bg-destructive mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">Occupied</p>
          </Card>
          <Card className="text-center p-4">
            <div className="w-4 h-4 rounded-full bg-warning mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">Moving Car</p>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
