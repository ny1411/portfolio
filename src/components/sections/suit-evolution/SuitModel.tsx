import { useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { Box3, Mesh, Vector3, type Group, type Material } from 'three';
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js';

import type { SuitEvolutionExperience } from './suitEvolutionData';
import { suitEvolutionExperiences } from './suitEvolutionData';
import { useSuitEvolutionStore } from './useSuitEvolutionStore';

interface SuitModelProps {
	experience: SuitEvolutionExperience;
	index: number;
}

export function SuitModel({ experience, index }: SuitModelProps) {
	const groupRef = useRef<Group>(null);
	const { size } = useThree();
	const { scene } = useGLTF(experience.modelUrl);
	const preparedModel = useMemo(() => prepareModel(scene), [scene]);



	useEffect(() => {
		return () => {
			for (const material of preparedModel.materials) material.dispose();
		};
	}, [preparedModel.materials]);

	useFrame(({ clock }) => {
		const group = groupRef.current;
		if (!group) return;

		const state = useSuitEvolutionStore.getState();
		const isCompact = size.width <= 900;
		const opacity = state.activeSuitIndex === index ? 1 : 0;
		const activeLift = opacity * 0.05;
		const hoverX = state.hoverVector.x;
		const hoverY = state.hoverVector.y;
		const transitionLift = state.transitionProgress * 0.08;
		const breathing = Math.sin(clock.elapsedTime * 1.7 + index) * 0.018;
		const placement = getSuitPlacement(index, isCompact);
		const compactScaleFactor = isCompact
			? Math.min(1, Math.max(0.72, size.width / 430))
			: 1;
		const compactYOffset = isCompact ? 0.42 : 0;
		const hoverTravelX = isCompact ? 0.025 : 0.06;
		const hoverTravelY = isCompact ? 0.018 : 0.035;

		group.visible = opacity > 0.14;
		group.position.x = placement.x + hoverX * hoverTravelX;
		group.position.y =
			placement.y + compactYOffset + activeLift + transitionLift - hoverY * hoverTravelY;
		group.position.z = (1 - opacity) * -0.36;
		group.rotation.y = placement.rotationY;
		group.scale.setScalar(
			preparedModel.scale *
				placement.scale *
				compactScaleFactor *
				(0.98 + breathing + opacity * 0.035),
		);
	});

	return (
		<group ref={groupRef}>
			{index === 0 && <FirstSuitKeyLight />}
			{index === 1 && <SecondSuitKeyLight />}
			{index === 2 && <ThirdSuitGoldLight />}
			<primitive object={preparedModel.model} />
			
		</group>
	);
}

function SecondSuitKeyLight() {
	return (
		<>
			<pointLight color="#ff5a5f" distance={2.8} intensity={4.8} position={[0.12, 1.12, 0.45]} />
			<pointLight color="#38bdf8" distance={2.4} intensity={2.8} position={[-0.52, 0.98, 0.36]} />
			<spotLight
				angle={0.48}
				color="#fff5f5"
				distance={3.5}
				intensity={2.1}
				penumbra={0.6}
				position={[1.24, 1.58, 1.16]}
			/>
		</>
	);
}

function FirstSuitKeyLight() {
	return (
		<>
			<pointLight color="#ffd6a5" distance={2.6} intensity={4.4} position={[0.16, 1.12, 0.42]} />
			<pointLight color="#8ecae6" distance={2.2} intensity={2.2} position={[-0.5, 1.05, 0.34]} />
			<spotLight
				angle={0.46}
				color="#fff1cf"
				distance={3.4}
				intensity={3.8}
				penumbra={0.62}
				position={[0.4, 1.75, 1.5]}
			/>
		</>
	);
}

function ThirdSuitGoldLight() {
	return (
		<>
			<pointLight color="#ffd166" distance={2.4} intensity={6.2} position={[0.08, 1.05, 0.38]} />
			<pointLight color="#ffb703" distance={2} intensity={4.6} position={[-0.42, 1.08, 0.28]} />
			<pointLight color="#fff1a8" distance={1.8} intensity={3.8} position={[0.45, 1.15, 0.3]} />
			<spotLight
				angle={0.42}
				color="#ffe08a"
				distance={3.2}
				intensity={5.4}
				penumbra={0.58}
				position={[0.18, 1.45, 1.05]}
			/>
		</>
	);
}

function getSuitPlacement(
	index: number,
	isCompact: boolean,
): { x: number; y: number; scale: number; rotationY: number } {
	if (isCompact) return { x: 0, y: 0.18, scale: 0.68, rotationY: 0 };

	if (index === 1) return { x: 2, y: -0.05, scale: 0.6, rotationY: -Math.PI / 12};
	if (index === 2) return { x: 2, y: -0.05, scale: 0.6, rotationY: Math.PI / 3 + 0.2 };

	return { x: 2, y: -1.3, scale: 0.54, rotationY: -Math.PI / 12 };
}

function prepareModel(scene: Group): {
	model: Group;
	materials: Material[];
	scale: number;
} {
	const model = cloneSkeleton(scene) as Group;
	const materials: Material[] = [];

	model.traverse((child) => {
		if (!(child instanceof Mesh)) return;

		child.castShadow = false;
		child.receiveShadow = false;
		child.frustumCulled = false;

		const sourceMaterials = Array.isArray(child.material)
			? child.material
			: [child.material];
		const clonedMaterials = sourceMaterials.map((sourceMaterial) =>
			sourceMaterial.clone(),
		);

		child.material = Array.isArray(child.material)
			? clonedMaterials
			: clonedMaterials[0];
		materials.push(...clonedMaterials);
	});

	const bounds = new Box3().setFromObject(model);
	const center = bounds.getCenter(new Vector3());
	const size = bounds.getSize(new Vector3());
	const largestAxis = Math.max(size.x, size.y, size.z, 1);
	const scale = 4.32 / largestAxis;

	model.position.set(-center.x, -center.y, -center.z);

	return { model, materials, scale };
}

suitEvolutionExperiences.forEach((experience) => {
	useGLTF.preload(experience.modelUrl);
});
