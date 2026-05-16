import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Bounds, Center, useGLTF } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import {
	CanvasTexture,
	Mesh,
	MeshPhysicalMaterial,
	RepeatWrapping,
	type Group,
} from 'three';
import { preloadSpiderLogoModel, spiderLogoUrl } from '../../lib/spiderLogoModel';

interface SpiderLogoLoaderProps {
	label?: string;
	onModelReady?: () => void;
}

export function SpiderLogoLoader({
	label = 'Loading scene',
	onModelReady,
}: SpiderLogoLoaderProps) {
	const canRender3d = useMemo(() => hasWebGL(), []);

	useEffect(() => {
		if (canRender3d) return;

		onModelReady?.();
	}, [canRender3d, onModelReady]);

	return (
		<div
			className="startup-loader"
			role="status"
			aria-live="polite"
			aria-label={label}
		>
			<div className="startup-loader__visual">
				{canRender3d ? (
					<Canvas
						className="startup-loader__canvas"
						camera={{ position: [0, 0, 50], fov: 50 }}
					>
						<ambientLight intensity={1.15} />
						<pointLight intensity={3.2} position={[3, 4, 5]} />
						<Suspense fallback={null}>
							<Bounds fit clip observe margin={1.35}>
								<Center>
									<SpinningSpiderLogo onReady={onModelReady} />
								</Center>
							</Bounds>
						</Suspense>
					</Canvas>
				) : (
					<div className="startup-loader__fallback" aria-hidden="true" />
				)}
			</div>
			<span className="startup-loader__label">{label}</span>
		</div>
	);
}

preloadSpiderLogoModel();
useGLTF.preload(spiderLogoUrl);

function SpinningSpiderLogo({ onReady }: { onReady?: () => void }) {
	const groupRef = useRef<Group>(null);
	const { scene } = useGLTF(spiderLogoUrl);
	const model = useMemo(() => {
		const grain = createNoiseTexture();
		const spiderRed = new MeshPhysicalMaterial({
			color: '#c1121f',
			emissive: '#5f0f1a',
			emissiveIntensity: 0.8,
			metalness: 0.3,
			roughness: 0.68,
			roughnessMap: grain,
			bumpMap: grain,
			bumpScale: 0.025,
			envMapIntensity: 0.25,
		});
		const clonedScene = scene.clone(true);

		clonedScene.traverse((child) => {
			if (child instanceof Mesh) child.material = spiderRed;
		});

		return clonedScene;
	}, [scene]);

	useEffect(() => {
		onReady?.();
	}, [onReady]);

	useFrame((_, delta) => {
		if (!groupRef.current) return;

		groupRef.current.rotation.y += delta * 1.85;
		groupRef.current.rotation.x = Math.sin(performance.now() * 0.0012) * 0.14;
	});

	return (
		<group ref={groupRef}>
			<primitive object={model} />
		</group>
	);
}

function createNoiseTexture(size = 256): CanvasTexture {
	const canvas = document.createElement('canvas');
	canvas.width = size;
	canvas.height = size;

	const context = canvas.getContext('2d');
	if (!context) return new CanvasTexture(canvas);

	const imageData = context.createImageData(size, size);
	for (let index = 0; index < imageData.data.length; index += 4) {
		const shade = Math.random() * 255;

		imageData.data[index] = shade;
		imageData.data[index + 1] = shade;
		imageData.data[index + 2] = shade;
		imageData.data[index + 3] = 255;
	}

	context.putImageData(imageData, 0, 0);

	const texture = new CanvasTexture(canvas);
	texture.wrapS = RepeatWrapping;
	texture.wrapT = RepeatWrapping;
	texture.repeat.set(6, 6);

	return texture;
}

function hasWebGL(): boolean {
	if (typeof document === 'undefined') return false;

	const canvas = document.createElement('canvas');
	return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
}
