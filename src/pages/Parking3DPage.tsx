import { useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Box, Plane, RoundedBox } from "@react-three/drei";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { ParkingCircle } from "lucide-react";
import * as THREE from "three";

// Sensor light that blinks based on status
function SensorLight({ position, status }: { position: [number, number, number]; status: string }) {
  const ref = useRef<THREE.Mesh>(null);
  const colors: Record<string, string> = {
    available: "#22c55e",
    occupied: "#ef4444",
    reserved: "#eab308",
    booking: "#3b82f6",
  };
  const color = colors[status] || "#22c55e";
  const shouldBlink = status === "available" || status === "reserved";

  useFrame((state) => {
    if (ref.current && shouldBlink) {
      const mat = ref.current.material as THREE.MeshStandardMaterial;
      const pulse = (Math.sin(state.clock.elapsedTime * (status === "available" ? 3 : 2) + position[0] * 2) + 1) / 2;
      mat.emissiveIntensity = 0.3 + pulse * 1.2;
    }
  });

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.03, 12, 12]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={shouldBlink ? 0.8 : 1.0} />
    </mesh>
  );
}

// Realistic car model
function CarModel({ position, color, animateEntry = false, animateExit = false }: {
  position: [number, number, number]; color: string; animateEntry?: boolean; animateExit?: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  const progressRef = useRef(animateEntry ? 0 : 1);

  useFrame((state, delta) => {
    if (!ref.current) return;
    // Hover animation
    ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.5 + position[0]) * 0.006;

    // Entry animation
    if (animateEntry && progressRef.current < 1) {
      progressRef.current = Math.min(1, progressRef.current + delta * 0.6);
      const t = progressRef.current;
      const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      ref.current.position.z = position[2] + (1 - ease) * 3;
      ref.current.position.x = position[0] + (1 - ease) * 0.5;
    }
    // Exit animation
    if (animateExit && progressRef.current > 0) {
      progressRef.current = Math.max(0, progressRef.current - delta * 0.6);
      const t = progressRef.current;
      ref.current.position.z = position[2] + (1 - t) * 3;
    }
  });

  return (
    <group ref={ref} position={position}>
      {/* Car body */}
      <RoundedBox args={[0.85, 0.22, 0.42]} position={[0, 0.12, 0]} radius={0.04} smoothness={4}>
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.2} />
      </RoundedBox>
      {/* Cabin */}
      <RoundedBox args={[0.48, 0.18, 0.38]} position={[0.02, 0.3, 0]} radius={0.06} smoothness={4}>
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.3} />
      </RoundedBox>
      {/* Windshield */}
      <RoundedBox args={[0.01, 0.14, 0.34]} position={[-0.22, 0.3, 0]} radius={0.02} smoothness={2}>
        <meshStandardMaterial color="#87CEEB" metalness={0.9} roughness={0.1} transparent opacity={0.6} />
      </RoundedBox>
      {/* Rear window */}
      <RoundedBox args={[0.01, 0.12, 0.32]} position={[0.22, 0.28, 0]} radius={0.02} smoothness={2}>
        <meshStandardMaterial color="#87CEEB" metalness={0.9} roughness={0.1} transparent opacity={0.6} />
      </RoundedBox>
      {/* Headlights */}
      {[[-0.43, 0.12, 0.15], [-0.43, 0.12, -0.15]].map((pos, i) => (
        <mesh key={`hl-${i}`} position={pos as [number, number, number]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color="#FFFDE7" emissive="#FFFDE7" emissiveIntensity={0.5} />
        </mesh>
      ))}
      {/* Tail lights */}
      {[[0.43, 0.12, 0.15], [0.43, 0.12, -0.15]].map((pos, i) => (
        <mesh key={`tl-${i}`} position={pos as [number, number, number]}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshStandardMaterial color="#FF1744" emissive="#FF1744" emissiveIntensity={0.3} />
        </mesh>
      ))}
      {/* Wheels */}
      {[[-0.28, 0.02, 0.22], [-0.28, 0.02, -0.22], [0.28, 0.02, 0.22], [0.28, 0.02, -0.22]].map((pos, i) => (
        <group key={`w-${i}`} position={pos as [number, number, number]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh>
            <cylinderGeometry args={[0.065, 0.065, 0.04, 16]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.021, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.005, 8]} />
            <meshStandardMaterial color="#9E9E9E" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Parking slot with sensor
function ParkingSlot({ position, status, label }: {
  position: [number, number, number];
  status: "available" | "occupied" | "reserved" | "booking";
  label: string;
}) {
  const colors: Record<string, string> = { available: "#22c55e", occupied: "#ef4444", reserved: "#eab308", booking: "#3b82f6" };
  const color = colors[status];
  const carColors = ["#1e40af", "#dc2626", "#7c3aed", "#ea580c", "#0891b2", "#4f46e5", "#059669"];

  return (
    <group position={position}>
      {/* Slot floor highlight */}
      <Plane args={[0.95, 0.55]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <meshStandardMaterial color={color} opacity={0.12} transparent />
      </Plane>
      {/* Slot border lines */}
      <Box args={[0.02, 0.015, 0.55]} position={[-0.475, 0.008, 0]}>
        <meshStandardMaterial color="#e0e0e0" />
      </Box>
      <Box args={[0.02, 0.015, 0.55]} position={[0.475, 0.008, 0]}>
        <meshStandardMaterial color="#e0e0e0" />
      </Box>
      <Box args={[0.95, 0.015, 0.02]} position={[0, 0.008, 0.275]}>
        <meshStandardMaterial color="#e0e0e0" />
      </Box>

      {/* Sensor light on pole */}
      <Box args={[0.02, 0.35, 0.02]} position={[0.4, 0.175, -0.22]}>
        <meshStandardMaterial color="#666" />
      </Box>
      <SensorLight position={[0.4, 0.37, -0.22]} status={status} />

      {/* Label */}
      <Text position={[0, 0.02, 0.35]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.08} color={color} fontWeight="bold">
        {label}
      </Text>

      {/* Car if occupied/reserved */}
      {(status === "occupied" || status === "reserved") && (
        <CarModel
          position={[0, 0, 0]}
          color={carColors[label.charCodeAt(0) % carColors.length]}
          animateEntry={status === "reserved"}
        />
      )}
      {status === "booking" && (
        <CarModel position={[0, 0, 0]} color="#3b82f6" animateEntry />
      )}
    </group>
  );
}

// Moving car in the lane
function MovingCar() {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.position.x = Math.sin(t * 0.4) * 4.5;
    ref.current.position.z = Math.cos(t * 0.4) * 2 + 3.5;
    ref.current.rotation.y = Math.atan2(Math.cos(t * 0.4) * 0.4, -Math.sin(t * 0.4) * 4.5);
  });
  return (
    <group ref={ref}>
      <CarModel position={[0, 0, 0]} color="#f59e0b" />
    </group>
  );
}

// Parking structure
function ParkingStructure() {
  const pillars: [number, number, number][] = [
    [-3.5, 1.2, -1.5], [3.5, 1.2, -1.5], [-3.5, 1.2, 1.5], [3.5, 1.2, 1.5],
  ];
  return (
    <group>
      {pillars.map((pos, i) => (
        <RoundedBox key={i} args={[0.12, 2.4, 0.12]} position={pos} radius={0.02} smoothness={2}>
          <meshStandardMaterial color="#9E9E9E" roughness={0.6} />
        </RoundedBox>
      ))}
      <Box args={[7.2, 0.06, 0.15]} position={[0, 2.4, -1.5]}>
        <meshStandardMaterial color="#78909C" />
      </Box>
      <Box args={[7.2, 0.06, 0.15]} position={[0, 2.4, 1.5]}>
        <meshStandardMaterial color="#78909C" />
      </Box>
    </group>
  );
}

// Full scene
function ParkingLotScene() {
  const slots = useMemo(() => {
    const result = [];
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 6; col++) {
        const rand = Math.random();
        const status = rand > 0.6 ? "occupied" : rand > 0.3 ? "available" : rand > 0.15 ? "reserved" : "booking";
        result.push({
          position: [col * 1.15 - 2.875, 0, row * 1.3 - 0.65] as [number, number, number],
          status: status as "available" | "occupied" | "reserved" | "booking",
          label: `${String.fromCharCode(65 + row)}${col + 1}`,
        });
      }
    }
    return result;
  }, []);

  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[8, 12, 5]} intensity={1.2} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <pointLight position={[-4, 5, -3]} intensity={0.4} color="#3b82f6" />
      <pointLight position={[4, 5, 3]} intensity={0.3} color="#f59e0b" />
      <hemisphereLight intensity={0.2} color="#87CEEB" groundColor="#444" />

      {/* Ground */}
      <Plane args={[14, 10]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <meshStandardMaterial color="#2d3436" roughness={0.95} />
      </Plane>

      {/* Lane */}
      <Box args={[9, 0.008, 0.5]} position={[0, 0.004, 1.5]}>
        <meshStandardMaterial color="#3d4f5f" />
      </Box>
      {Array.from({ length: 8 }).map((_, i) => (
        <Box key={i} args={[0.3, 0.01, 0.06]} position={[i * 1.1 - 3.85, 0.006, 1.5]}>
          <meshStandardMaterial color="#FFD54F" />
        </Box>
      ))}

      <ParkingStructure />
      {slots.map((slot, i) => (
        <ParkingSlot key={i} position={slot.position} status={slot.status} label={slot.label} />
      ))}
      <MovingCar />

      <Text position={[0, 2.8, -2]} fontSize={0.25} color="#3b82f6" fontWeight="bold">
        SmartPark - 3D View
      </Text>

      <OrbitControls enablePan enableZoom enableRotate maxPolarAngle={Math.PI / 2.1} minDistance={3} maxDistance={15} autoRotate autoRotateSpeed={0.5} />
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
          <p className="text-muted-foreground">Interactive 3D view with real-time sensor indicators</p>
        </div>

        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="h-[600px] bg-foreground/5">
              <Canvas camera={{ position: [6, 5, 6], fov: 45 }} shadows>
                <ParkingLotScene />
              </Canvas>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Available", color: "bg-accent", desc: "Green blinking sensor" },
            { label: "Occupied", color: "bg-destructive", desc: "Red steady sensor" },
            { label: "Reserved", color: "bg-warning", desc: "Yellow blinking sensor" },
            { label: "Booking", color: "bg-primary", desc: "Blue — car entering" },
          ].map((item) => (
            <Card key={item.label} className="text-center p-4">
              <div className={`w-4 h-4 rounded-full ${item.color} mx-auto mb-2`} />
              <p className="text-sm font-medium text-foreground">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
