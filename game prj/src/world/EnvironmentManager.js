import * as THREE from 'three';

export class EnvironmentManager {
  constructor(scene) {
    this.scene = scene;
    this.dirLight = null;
    this.hemiLight = null;
    this.rainParticles = null;
    this.sparkParticles = [];
    this.isRaining = false;
    this.timeOfDay = "day"; // 'day', 'sunset', 'night'
  }

  initEnvironment() {
    // 1. Lights
    this.hemiLight = new THREE.HemisphereLight(0xffffff, 0x444455, 0.9);
    this.hemiLight.position.set(0, 50, 0);
    this.scene.add(this.hemiLight);

    this.dirLight = new THREE.DirectionalLight(0xfffaed, 1.2);
    this.dirLight.position.set(60, 100, 40);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.camera.far = 250;
    const shadowD = 90;
    this.dirLight.shadow.camera.left = -shadowD;
    this.dirLight.shadow.camera.right = shadowD;
    this.dirLight.shadow.camera.top = shadowD;
    this.dirLight.shadow.camera.bottom = -shadowD;
    this.scene.add(this.dirLight);

    // Default Day Sky
    this.scene.background = new THREE.Color(0x87ceeb);

    // 2. Rain Particles Setup
    const rainCount = 1500;
    const rainGeo = new THREE.BufferGeometry();
    const rainPos = new Float32Array(rainCount * 3);

    for (let i = 0; i < rainCount * 3; i += 3) {
      rainPos[i] = (Math.random() - 0.5) * 120;
      rainPos[i + 1] = Math.random() * 40;
      rainPos[i + 2] = (Math.random() - 0.5) * 120;
    }

    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
    const rainMat = new THREE.PointsMaterial({
      color: 0xaaccff,
      size: 0.15,
      transparent: true,
      opacity: 0.6
    });

    this.rainParticles = new THREE.Points(rainGeo, rainMat);
    this.rainParticles.visible = false;
    this.scene.add(this.rainParticles);
  }

  setTimeOfDay(time) {
    this.timeOfDay = time;
    if (time === "day") {
      this.scene.background.setHex(0x87ceeb);
      this.dirLight.color.setHex(0xfffaed);
      this.dirLight.intensity = 1.2;
      this.hemiLight.intensity = 0.9;
    } else if (time === "sunset") {
      this.scene.background.setHex(0xf4a261);
      this.dirLight.color.setHex(0xe76f51);
      this.dirLight.intensity = 0.8;
      this.hemiLight.intensity = 0.5;
    } else if (time === "night") {
      this.scene.background.setHex(0x0a0a1a);
      this.dirLight.color.setHex(0x334466);
      this.dirLight.intensity = 0.2;
      this.hemiLight.intensity = 0.15;
    }
  }

  toggleRain() {
    this.isRaining = !this.isRaining;
    this.rainParticles.visible = this.isRaining;
    return this.isRaining;
  }

  spawnCollisionSparks(pos) {
    const count = 12;
    for (let i = 0; i < count; i++) {
      const geo = new THREE.SphereGeometry(0.08, 6, 6);
      const mat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(pos);
      this.scene.add(mesh);

      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 8,
        Math.random() * 6 + 2,
        (Math.random() - 0.5) * 8
      );

      this.sparkParticles.push({ mesh, vel, life: 0.4 });
    }
  }

  update(delta, cameraPos) {
    // 1. Rain Follow Camera
    if (this.isRaining && this.rainParticles && cameraPos) {
      this.rainParticles.position.x = cameraPos.x;
      this.rainParticles.position.z = cameraPos.z;

      const posAttr = this.rainParticles.geometry.attributes.position;
      for (let i = 0; i < posAttr.count; i++) {
        let y = posAttr.getY(i);
        y -= delta * 35;
        if (y < 0) y = 40;
        posAttr.setY(i, y);
      }
      posAttr.needsUpdate = true;
    }

    // 2. Spark particles animation
    for (let i = this.sparkParticles.length - 1; i >= 0; i--) {
      const p = this.sparkParticles[i];
      p.life -= delta;
      p.mesh.position.addScaledVector(p.vel, delta);
      p.vel.y -= 9.8 * delta; // Gravity

      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        this.sparkParticles.splice(i, 1);
      }
    }
  }
}
