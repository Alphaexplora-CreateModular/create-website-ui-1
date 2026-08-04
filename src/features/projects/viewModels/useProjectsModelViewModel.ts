import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export function useProjectsModelViewModel() {
  const modelMountRef = useRef<HTMLDivElement>(null);
  const [modelLoading, setModelLoading] = useState(true);
  const [modelError, setModelError] = useState(false);

  useEffect(() => {
    const mount = modelMountRef.current;
    if (!mount) return;

    let width = mount.clientWidth;
    let height = mount.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height || 1, 0.1, 1000);
    camera.position.set(0, 0, 5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x2d2623, 1.2);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
    keyLight.position.set(4, 6, 6);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.6);
    fillLight.position.set(-4, -2, -4);
    scene.add(fillLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 1.8;
    controls.maxDistance = 10;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.1;

    let resumeTimeout: ReturnType<typeof setTimeout>;
    controls.addEventListener("start", () => {
      controls.autoRotate = false;
      clearTimeout(resumeTimeout);
    });
    controls.addEventListener("end", () => {
      resumeTimeout = setTimeout(() => {
        controls.autoRotate = true;
      }, 2500);
    });

    let frameId: number;
    let loadedObject: THREE.Object3D | null = null;

    const baseUrl = import.meta.env.BASE_URL;
    const modelBasePath = `${baseUrl}models/`;
    const textureBasePath = `${modelBasePath}textures/`;

    const gltfLoader = new GLTFLoader();
    const textureLoader = new THREE.TextureLoader();
    textureLoader.setPath(textureBasePath);

    const normalizeMaterialName = (name?: string) => {
      if (!name) return "";
      return name.replace(/\.\d+$/, "").trim().toLowerCase();
    };

    const loadTexture = (fileName: string, isColor = false) => {
      const texture = textureLoader.load(fileName, undefined, undefined, (error) => {
        console.error(
          `[3D Model] Failed to load texture: ${textureBasePath}${fileName}`,
          error,
        );
      });
      texture.flipY = false;
      if (isColor) {
        texture.colorSpace = THREE.SRGBColorSpace;
      }
      return texture;
    };

    const materialTextureMap: Record<
      string,
      {
        baseColor?: string;
        normal?: string;
        roughness?: string;
      }
    > = {
      "white plaster": {
        baseColor: "White Plaster Base Color.png",
        normal: "White Plaster Normal.png",
        roughness: "White Plaster Roughness.png",
      },
      "wood 1": {
        baseColor: "Wood 1 Base Color.png",
        normal: "Wood 1 Normal.png",
        roughness: "Wood 1 Roughness.png",
      },
      "wood 8": {
        baseColor: "Wood 8 Base Color.png",
        normal: "Wood 8 Normal.png",
        roughness: "Wood 8 Roughness.png",
      },
    };

    const applyTexturesToMaterial = (material: THREE.Material) => {
      const stdMat = material as THREE.MeshStandardMaterial;
      const textureSet = materialTextureMap[normalizeMaterialName(stdMat.name)];
      if (!textureSet) return;

      if (textureSet.baseColor) {
        stdMat.map = loadTexture(textureSet.baseColor, true);
      }
      if (textureSet.normal) {
        stdMat.normalMap = loadTexture(textureSet.normal);
      }
      if (textureSet.roughness) {
        stdMat.roughnessMap = loadTexture(textureSet.roughness);
      }

      stdMat.needsUpdate = true;
    };

    gltfLoader.setResourcePath(modelBasePath);

    gltfLoader.load(
      `${modelBasePath}Low+Poly+Kitchen.gltf`,
      (gltf) => {
        const object = gltf.scene;
        const box = new THREE.Box3().setFromObject(object);
        const size = box.getSize(new THREE.Vector3());

        const isEmpty =
          !isFinite(size.x) || !isFinite(size.y) || !isFinite(size.z) || size.x + size.y + size.z === 0;

        if (isEmpty) {
          console.error(
            '[3D Model] "/models/Low+Poly+Kitchen.gltf" loaded but contained no usable geometry.',
          );
          setModelError(true);
          setModelLoading(false);
          return;
        }

        const center = box.getCenter(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        const scaleFactor = 2.4 / maxDim;

        object.traverse((child) => {
          const mesh = child as THREE.Mesh;
          if ((mesh as any).isMesh) {
            if (!mesh.geometry.attributes.normal) {
              mesh.geometry.computeVertexNormals();
            }

            if (mesh.material) {
              const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
              materials.forEach((material: any) => {
                material.side = THREE.DoubleSide;
                applyTexturesToMaterial(material as THREE.Material);
              });
            }
          }
        });

        object.scale.setScalar(scaleFactor);
        object.position.sub(center.multiplyScalar(scaleFactor));

        loadedObject = object;
        scene.add(object);
        setModelLoading(false);
      },
      undefined,
      (error) => {
        console.error("Failed to load /models/Low+Poly+Kitchen.gltf:", error);
        setModelError(true);
        setModelLoading(false);
      },
    );

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      width = mount.clientWidth;
      height = mount.clientHeight;
      if (!width || !height) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(mount);

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(resumeTimeout);
      resizeObserver.disconnect();
      controls.dispose();

      if (loadedObject) {
        loadedObject.traverse((child) => {
          const mesh = child as THREE.Mesh;
          if ((mesh as any).isMesh) {
            mesh.geometry.dispose();
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach((material) => material.dispose());
            } else {
              mesh.material.dispose();
            }
          }
        });
      }

      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return {
    state: {
      modelLoading,
      modelError,
    },
    refs: {
      modelMountRef,
    },
  };
}

export type ProjectsModelViewModel = ReturnType<typeof useProjectsModelViewModel>;