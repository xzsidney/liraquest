import * as THREE from 'three';
import * as CANNON from 'cannon-es';
export class Dice3DEngine {
    canvas;
    scene;
    camera;
    renderer;
    world;
    dice = [];
    isRolling = false;
    animFrameId = null;
    onSettleCallback;
    audioCtx = null;
    // Geometria e Física D10 Monolítica (Multi-material com 10 grupos)
    d10Geometry;
    d10Shape;
    d10FaceNormals = [];
    // Materiais das 10 Faces
    regularMaterials = [];
    hungerMaterials = [];
    constructor(options) {
        this.canvas = options.canvas;
        this.onSettleCallback = options.onSettle;
        // Configuração de Three.js Scene
        this.scene = new THREE.Scene();
        // Câmera com ângulo imersivo
        const width = this.canvas.clientWidth || window.innerWidth;
        const height = this.canvas.clientHeight || window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
        this.camera.position.set(0, 24, 15);
        this.camera.lookAt(0, 0, 0);
        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowMap;
        this.setupLighting();
        // Física Cannon-es
        this.world = new CANNON.World({
            gravity: new CANNON.Vec3(0, -36, 0)
        });
        this.world.defaultContactMaterial.friction = 0.35;
        this.world.defaultContactMaterial.restitution = 0.5;
        this.setupBoundaries();
        // Ordem das 10 faces (5 superiores: 10, 2, 8, 4, 6 | 5 inferiores opostas: 7, 5, 1, 9, 3)
        // Cada par oposto soma 11 (10 <-> 1, 2 <-> 9, 8 <-> 3, 4 <-> 7, 6 <-> 5)
        const faceValues = [10, 2, 8, 4, 6, 7, 5, 1, 9, 3];
        // Construção da Geometria Monolítica do D10 com Projeção Conforme
        const { geometry, shape, normals, textPositions } = this.buildD10GeometryAndPhysics(faceValues);
        this.d10Geometry = geometry;
        this.d10Shape = shape;
        this.d10FaceNormals = normals;
        // Criar materiais das 10 faces com alinhamento milimétrico
        this.regularMaterials = faceValues.map((v, i) => this.createFaceMaterial(v, 'regular', textPositions[i]));
        this.hungerMaterials = faceValues.map((v, i) => this.createFaceMaterial(v, 'hunger', textPositions[i]));
        // Loop
        this.animate = this.animate.bind(this);
        this.animate();
        window.addEventListener('resize', this.onWindowResize.bind(this));
    }
    initAudio() {
        if (!this.audioCtx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                this.audioCtx = new AudioContextClass();
            }
        }
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
    }
    playClackSound(velocity) {
        if (!this.audioCtx)
            return;
        const vol = Math.min(Math.max((velocity - 1) / 14, 0.05), 0.35);
        if (vol <= 0.05)
            return;
        try {
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            const filter = this.audioCtx.createBiquadFilter();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(150 + Math.random() * 90, this.audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(35, this.audioCtx.currentTime + 0.06);
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(950 + Math.random() * 500, this.audioCtx.currentTime);
            gain.gain.setValueAtTime(vol, this.audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.07);
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.audioCtx.destination);
            osc.start();
            osc.stop(this.audioCtx.currentTime + 0.07);
        }
        catch {
            // Audio fallback
        }
    }
    setupLighting() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
        this.scene.add(ambientLight);
        const dirLight = new THREE.DirectionalLight(0xfff5ea, 2.2);
        dirLight.position.set(14, 30, 16);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 1024;
        dirLight.shadow.mapSize.height = 1024;
        dirLight.shadow.camera.near = 0.5;
        dirLight.shadow.camera.far = 60;
        dirLight.shadow.camera.left = -16;
        dirLight.shadow.camera.right = 16;
        dirLight.shadow.camera.top = 16;
        dirLight.shadow.camera.bottom = -16;
        this.scene.add(dirLight);
        const gothicRed = new THREE.DirectionalLight(0xcc2233, 1.2);
        gothicRed.position.set(-15, 12, -10);
        this.scene.add(gothicRed);
    }
    setupBoundaries() {
        const floorShape = new CANNON.Plane();
        const floorBody = new CANNON.Body({ mass: 0, shape: floorShape });
        floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        this.world.addBody(floorBody);
        const floorGeo = new THREE.PlaneGeometry(60, 60);
        const floorMat = new THREE.ShadowMaterial({ opacity: 0.45 });
        const floorMesh = new THREE.Mesh(floorGeo, floorMat);
        floorMesh.rotation.x = -Math.PI / 2;
        floorMesh.receiveShadow = true;
        this.scene.add(floorMesh);
        const wallHalfWidth = 14;
        const wallHalfHeight = 10;
        const wallHeight = 25;
        const createWall = (x, y, z, q) => {
            const wallShape = new CANNON.Plane();
            const wallBody = new CANNON.Body({ mass: 0, shape: wallShape, position: new CANNON.Vec3(x, y, z) });
            wallBody.quaternion.copy(q);
            this.world.addBody(wallBody);
        };
        const qNorth = new CANNON.Quaternion();
        createWall(0, wallHeight / 2, -wallHalfHeight, qNorth);
        const qSouth = new CANNON.Quaternion();
        qSouth.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI);
        createWall(0, wallHeight / 2, wallHalfHeight, qSouth);
        const qEast = new CANNON.Quaternion();
        qEast.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI / 2);
        createWall(wallHalfWidth, wallHeight / 2, 0, qEast);
        const qWest = new CANNON.Quaternion();
        qWest.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 2);
        createWall(-wallHalfWidth, wallHeight / 2, 0, qWest);
    }
    /**
     * Constrói a geometria 3D do D10 com Projeção Conforme
     */
    buildD10GeometryAndPhysics(faceValues) {
        const scale = 1.35;
        const h = 1.5 * scale;
        const r = 1.55 * scale;
        const h0 = 0.24 * scale;
        // 12 Vértices
        const vertices = [];
        vertices.push(new THREE.Vector3(0, h, 0)); // 0: Apex Superior
        vertices.push(new THREE.Vector3(0, -h, 0)); // 1: Apex Inferior
        for (let i = 0; i < 10; i++) {
            const angle = (i * Math.PI) / 5;
            const y = i % 2 === 0 ? h0 : -h0;
            const x = r * Math.cos(angle);
            const z = r * Math.sin(angle);
            vertices.push(new THREE.Vector3(x, y, z));
        }
        const upperKites = [
            { vApex: 0, vLeft: 11, vCenter: 2, vRight: 3 },
            { vApex: 0, vLeft: 3, vCenter: 4, vRight: 5 },
            { vApex: 0, vLeft: 5, vCenter: 6, vRight: 7 },
            { vApex: 0, vLeft: 7, vCenter: 8, vRight: 9 },
            { vApex: 0, vLeft: 9, vCenter: 10, vRight: 11 }
        ];
        const lowerKites = [
            { vApex: 1, vLeft: 2, vCenter: 3, vRight: 4 },
            { vApex: 1, vLeft: 4, vCenter: 5, vRight: 6 },
            { vApex: 1, vLeft: 6, vCenter: 7, vRight: 8 },
            { vApex: 1, vLeft: 8, vCenter: 9, vRight: 10 },
            { vApex: 1, vLeft: 10, vCenter: 11, vRight: 2 }
        ];
        const positions = [];
        const normals = [];
        const uvs = [];
        const faceNormalsList = [];
        const cannonFaces = [];
        const textPositions = [];
        const geometry = new THREE.BufferGeometry();
        let faceIndex = 0;
        // Processador com Projeção Conforme Planar
        const addKiteFace = (val, pApex, pLeft, pCenter, pRight, cannonIndices) => {
            // Vetor Normal da Face
            const vA = new THREE.Vector3().subVectors(pLeft, pApex);
            const vB = new THREE.Vector3().subVectors(pRight, pApex);
            let norm = new THREE.Vector3().crossVectors(vA, vB).normalize();
            const fCenter = new THREE.Vector3().add(pApex).add(pLeft).add(pCenter).add(pRight).multiplyScalar(0.25);
            if (norm.dot(fCenter) < 0)
                norm.negate();
            faceNormalsList.push({ value: val, normal: norm.clone() });
            // Eixo Y no plano da face (do Centro em direção ao Apex)
            const axisY = new THREE.Vector3().subVectors(pApex, pCenter).normalize();
            // Eixo X no plano da face (da Esquerda para a Direita)
            const axisX = new THREE.Vector3().crossVectors(axisY, norm).normalize();
            if (axisX.dot(new THREE.Vector3().subVectors(pRight, pLeft)) < 0) {
                axisX.negate();
            }
            // Projetar os 4 vértices no plano 2D local
            const proj = (p) => {
                const d = new THREE.Vector3().subVectors(p, fCenter);
                return { x: d.dot(axisX), y: d.dot(axisY) };
            };
            const ptApex = proj(pApex);
            const ptLeft = proj(pLeft);
            const ptCenter = proj(pCenter);
            const ptRight = proj(pRight);
            // Bounding box da face
            const minX = Math.min(ptApex.x, ptLeft.x, ptCenter.x, ptRight.x);
            const maxX = Math.max(ptApex.x, ptLeft.x, ptCenter.x, ptRight.x);
            const minY = Math.min(ptApex.y, ptLeft.y, ptCenter.y, ptRight.y);
            const maxY = Math.max(ptApex.y, ptLeft.y, ptCenter.y, ptRight.y);
            const spanX = (maxX - minX) * 1.12;
            const spanY = (maxY - minY) * 1.12;
            const midX = (minX + maxX) / 2;
            const midY = (minY + maxY) / 2;
            // Função de mapeamento Conforme para UV [0..1]
            const toUV = (pt) => {
                const u = (pt.x - midX) / spanX + 0.5;
                const v = (pt.y - midY) / spanY + 0.5;
                return [u, v];
            };
            const uvA = toUV(ptApex);
            const uvL = toUV(ptLeft);
            const uvC = toUV(ptCenter);
            const uvR = toUV(ptRight);
            const canvasPt = (uv) => [uv[0] * 512, (1 - uv[1]) * 512];
            textPositions.push({
                x: 256,
                y: 256,
                kitePoly: [canvasPt(uvA), canvasPt(uvR), canvasPt(uvC), canvasPt(uvL)]
            });
            const startVertex = positions.length / 3;
            // Triângulo 1 (Apex, Left, Center)
            positions.push(pApex.x, pApex.y, pApex.z, pLeft.x, pLeft.y, pLeft.z, pCenter.x, pCenter.y, pCenter.z);
            normals.push(norm.x, norm.y, norm.z, norm.x, norm.y, norm.z, norm.x, norm.y, norm.z);
            uvs.push(uvA[0], uvA[1], uvL[0], uvL[1], uvC[0], uvC[1]);
            // Triângulo 2 (Apex, Center, Right)
            positions.push(pApex.x, pApex.y, pApex.z, pCenter.x, pCenter.y, pCenter.z, pRight.x, pRight.y, pRight.z);
            normals.push(norm.x, norm.y, norm.z, norm.x, norm.y, norm.z, norm.x, norm.y, norm.z);
            uvs.push(uvA[0], uvA[1], uvC[0], uvC[1], uvR[0], uvR[1]);
            geometry.addGroup(startVertex, 6, faceIndex);
            cannonFaces.push(cannonIndices);
            faceIndex++;
        };
        // 1. Faces Superiores
        for (let i = 0; i < upperKites.length; i++) {
            const k = upperKites[i];
            addKiteFace(faceValues[i], vertices[k.vApex], vertices[k.vLeft], vertices[k.vCenter], vertices[k.vRight], [k.vApex, k.vRight, k.vCenter, k.vLeft]);
        }
        // 2. Faces Inferiores
        for (let i = 0; i < lowerKites.length; i++) {
            const k = lowerKites[i];
            addKiteFace(faceValues[i + 5], vertices[k.vApex], vertices[k.vRight], vertices[k.vCenter], vertices[k.vLeft], [k.vApex, k.vLeft, k.vCenter, k.vRight]);
        }
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
        geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        const cannonPoints = vertices.map(v => new CANNON.Vec3(v.x, v.y, v.z));
        const shape = new CANNON.ConvexPolyhedron({
            vertices: cannonPoints,
            faces: cannonFaces
        });
        return { geometry, shape, normals: faceNormalsList, textPositions };
    }
    /**
     * Gera a textura de uma face com número centralizado, limpo e legível
     */
    createFaceMaterial(value, type, meta) {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        ctx.save();
        // 1. Fundo da Face
        const grad = ctx.createRadialGradient(256, 256, 30, 256, 256, 250);
        if (type === 'regular') {
            grad.addColorStop(0, '#282730');
            grad.addColorStop(0.65, '#15141b');
            grad.addColorStop(1, '#0a090e');
        }
        else {
            grad.addColorStop(0, '#b31515');
            grad.addColorStop(0.65, '#750000');
            grad.addColorStop(1, '#3d0000');
        }
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 512, 512);
        // 2. Traçado do Losango
        if (meta.kitePoly && meta.kitePoly.length === 4) {
            ctx.beginPath();
            ctx.moveTo(meta.kitePoly[0][0], meta.kitePoly[0][1]);
            ctx.lineTo(meta.kitePoly[1][0], meta.kitePoly[1][1]);
            ctx.lineTo(meta.kitePoly[2][0], meta.kitePoly[2][1]);
            ctx.lineTo(meta.kitePoly[3][0], meta.kitePoly[3][1]);
            ctx.closePath();
            ctx.strokeStyle = type === 'regular' ? '#d4af37' : '#ff4444';
            ctx.lineWidth = 14;
            ctx.stroke();
            ctx.strokeStyle = type === 'regular' ? 'rgba(212, 175, 55, 0.45)' : 'rgba(255, 120, 120, 0.45)';
            ctx.lineWidth = 4;
            ctx.stroke();
        }
        // 3. Tipografia Cinzel Nítida e Proporcional
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetY = 4;
        const tx = meta.x;
        const ty = meta.y;
        // Formatar números para fácil leitura (ex: ponto no 6. e 9.)
        const displayText = value === 6 ? '6.' : value === 9 ? '9.' : value.toString();
        if (type === 'regular') {
            ctx.fillStyle = '#ffdf66';
            ctx.font = 'bold 140px "Cinzel", "Arial", sans-serif';
            if (value === 10) {
                ctx.font = 'bold 115px "Cinzel", "Arial", sans-serif';
                ctx.fillText('10☥', tx, ty);
            }
            else {
                ctx.fillText(displayText, tx, ty);
            }
        }
        else {
            // Hunger Dice
            if (value === 10) {
                ctx.fillStyle = '#ff6b6b';
                ctx.font = 'bold 115px "Cinzel", "Arial", sans-serif';
                ctx.fillText('10☥', tx, ty);
            }
            else if (value === 1) {
                ctx.fillStyle = '#ff2222';
                ctx.font = 'bold 140px serif';
                ctx.fillText('1☠', tx, ty);
            }
            else if (value >= 6) {
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 140px "Cinzel", "Arial", sans-serif';
                ctx.fillText(displayText, tx, ty);
            }
            else {
                ctx.fillStyle = 'rgba(255, 210, 210, 0.75)';
                ctx.font = 'bold 140px "Cinzel", "Arial", sans-serif';
                ctx.fillText(displayText, tx, ty);
            }
        }
        ctx.restore();
        const texture = new THREE.CanvasTexture(canvas);
        texture.generateMipmaps = true;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.anisotropy = 4;
        return new THREE.MeshStandardMaterial({
            map: texture,
            roughness: type === 'regular' ? 0.22 : 0.28,
            metalness: type === 'regular' ? 0.35 : 0.15
        });
    }
    rollDice(regularCount, hungerCount) {
        this.initAudio();
        this.clearDice();
        this.isRolling = true;
        const totalDice = regularCount + hungerCount;
        const diceList = [];
        let index = 0;
        for (let i = 0; i < regularCount; i++) {
            const die = this.spawnDie('regular', index++, totalDice);
            diceList.push(die);
        }
        for (let i = 0; i < hungerCount; i++) {
            const die = this.spawnDie('hunger', index++, totalDice);
            diceList.push(die);
        }
        this.dice = diceList;
    }
    spawnDie(type, index, total) {
        const id = `die_${Date.now()}_${index}`;
        const materials = type === 'regular' ? this.regularMaterials : this.hungerMaterials;
        const mesh = new THREE.Mesh(this.d10Geometry, materials);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this.scene.add(mesh);
        const body = new CANNON.Body({
            mass: 1.5,
            shape: this.d10Shape,
            linearDamping: 0.15,
            angularDamping: 0.15
        });
        const angle = (index / Math.max(total, 1)) * Math.PI * 2;
        const spreadRadius = Math.min(1.5 + total * 0.35, 5.5);
        const startX = Math.cos(angle) * spreadRadius + (Math.random() - 0.5) * 1.5;
        const startZ = Math.sin(angle) * spreadRadius + (Math.random() - 0.5) * 1.5 + 3;
        const startY = 11 + Math.random() * 3 + index * 0.25;
        body.position.set(startX, startY, startZ);
        const forceX = -startX * (2.2 + Math.random() * 2);
        const forceZ = -(startZ - 1.5) * (2.2 + Math.random() * 2);
        const forceY = -(9 + Math.random() * 5);
        body.velocity.set(forceX, forceY, forceZ);
        body.angularVelocity.set((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40);
        body.addEventListener('collide', (event) => {
            const relVel = event.contact.getImpactVelocityAlongNormal();
            this.playClackSound(relVel);
        });
        this.world.addBody(body);
        return {
            id,
            type,
            mesh,
            body,
            faceNormals: this.d10FaceNormals,
            settled: false
        };
    }
    getUpwardFace(die) {
        const worldUp = new THREE.Vector3(0, 1, 0);
        let bestValue = 1;
        let maxDot = -Infinity;
        const dieQuat = die.mesh.quaternion;
        for (const fn of die.faceNormals) {
            const worldNormal = fn.normal.clone().applyQuaternion(dieQuat).normalize();
            const dot = worldNormal.dot(worldUp);
            if (dot > maxDot) {
                maxDot = dot;
                bestValue = fn.value;
            }
        }
        return bestValue;
    }
    clearDice() {
        for (const die of this.dice) {
            this.scene.remove(die.mesh);
            this.world.removeBody(die.body);
        }
        this.dice = [];
        this.isRolling = false;
    }
    animate() {
        this.animFrameId = requestAnimationFrame(this.animate);
        this.world.step(1 / 60);
        let allSettled = this.dice.length > 0;
        for (const die of this.dice) {
            die.mesh.position.copy(die.body.position);
            die.mesh.quaternion.copy(die.body.quaternion);
            const vel = die.body.velocity.length();
            const angVel = die.body.angularVelocity.length();
            if (vel < 0.12 && angVel < 0.15 && die.body.position.y < 3) {
                if (!die.settled) {
                    die.settled = true;
                    die.finalValue = this.getUpwardFace(die);
                }
            }
            else {
                allSettled = false;
            }
        }
        if (allSettled && this.isRolling) {
            this.isRolling = false;
            this.emitResults();
        }
        this.renderer.render(this.scene, this.camera);
    }
    emitResults() {
        if (!this.onSettleCallback)
            return;
        const results = this.dice.map(d => {
            const val = d.finalValue || this.getUpwardFace(d);
            return {
                id: d.id,
                type: d.type,
                value: val,
                isSuccess: val >= 6,
                isCrit: val === 10,
                isBestialFailure: d.type === 'hunger' && val === 1
            };
        });
        this.onSettleCallback(results);
    }
    onWindowResize() {
        if (!this.canvas)
            return;
        const width = this.canvas.clientWidth || window.innerWidth;
        const height = this.canvas.clientHeight || window.innerHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
    destroy() {
        if (this.animFrameId !== null) {
            cancelAnimationFrame(this.animFrameId);
        }
        window.removeEventListener('resize', this.onWindowResize.bind(this));
        this.clearDice();
        if (this.audioCtx) {
            this.audioCtx.close();
        }
        this.regularMaterials.forEach(m => m.dispose());
        this.hungerMaterials.forEach(m => m.dispose());
        this.renderer.dispose();
    }
}
