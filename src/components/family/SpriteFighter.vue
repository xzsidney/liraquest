<template>
  <div 
    ref="pixiContainer"
    class="sprite-fighter relative select-none pointer-events-none flex items-end justify-center"
    :style="{
      width: `${canvasWidth}px`,
      height: `${canvasHeight}px`,
      filter: state === 'hit' ? 'brightness(1.8) drop-shadow(0 0 10px rgba(239, 68, 68, 0.8))' : 'drop-shadow(0 4px 12px rgba(0,0,0,0.6))'
    }"
  ></div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { Application, Assets, AnimatedSprite, Texture } from 'pixi.js';
import mugenRegistry from '../../data/mugenRegistry.json';

export type FighterState = 'idle' | 'walk' | 'walkBack' | 'attack' | 'attackLight' | 'attackHeavy' | 'special' | 'hit' | 'win';

const props = withDefaults(
  defineProps<{
    character: string;
    state: FighterState;
    flip?: boolean;
    scale?: number;
  }>(),
  {
    character: 'capamerica',
    state: 'idle',
    flip: false,
    scale: 1.35,
  }
);

const pixiContainer = ref<HTMLDivElement | null>(null);
let app: Application | null = null;
let currentAnimSprite: AnimatedSprite | null = null;
const loadedTexturesCache: Record<string, Texture> = {};

const canvasWidth = computed(() => (props.character === 'colossus' ? 180 : 150) * (props.scale || 1.35));
const canvasHeight = computed(() => (props.character === 'colossus' ? 200 : 170) * (props.scale || 1.35));

const activeFrames = computed<string[]>(() => {
  const charKey = props.character.toLowerCase();
  const charData = (mugenRegistry as any)[charKey];
  
  if (charData) {
    if (props.state === 'idle') return charData.idle || ['0-0.png'];
    if (props.state === 'walk') return charData.walk || charData.idle;
    if (props.state === 'walkBack') return charData.walkBack || charData.walk || charData.idle;
    if (props.state === 'attack' || props.state === 'attackLight') return charData.attackLight || charData.idle;
    if (props.state === 'attackHeavy') return charData.attackHeavy || charData.attackLight || charData.idle;
    if (props.state === 'special') return charData.special || charData.attackHeavy || charData.idle;
    if (props.state === 'hit') return charData.hit || ['5000-0.png'];
    if (props.state === 'win') return charData.win || charData.idle;
  }
  
  return ['0-0.png'];
});

async function loadTexture(url: string): Promise<Texture> {
  if (loadedTexturesCache[url]) {
    return loadedTexturesCache[url];
  }
  try {
    const tex = await Assets.load(url);
    loadedTexturesCache[url] = tex;
    return tex;
  } catch (e) {
    console.error(`Erro ao carregar textura Pixi: ${url}`, e);
    return Texture.WHITE;
  }
}

async function renderPixiAnimation() {
  if (!app || !app.stage) return;

  const frames = activeFrames.value;
  if (!frames || frames.length === 0) return;

  const charKey = props.character.toLowerCase();
  const urls = frames.map(filename => `/sprites/${charKey}/${filename}`);

  const textures: Texture[] = [];
  for (const url of urls) {
    const tex = await loadTexture(url);
    textures.push(tex);
  }

  if (!app || !app.stage) return;

  if (currentAnimSprite) {
    app.stage.removeChild(currentAnimSprite);
    currentAnimSprite.destroy();
    currentAnimSprite = null;
  }

  const anim = new AnimatedSprite(textures);
  
  // Ajuste de velocidade do Pixi AnimatedSprite conforme o tipo de golpe
  if (props.state === 'attack' || props.state === 'attackLight' || props.state === 'attackHeavy') {
    anim.animationSpeed = 0.20;
  } else if (props.state === 'special') {
    anim.animationSpeed = 0.24;
  } else {
    anim.animationSpeed = 0.12;
  }
  
  anim.anchor.set(0.5, 1.0); // Ponto de ancoragem na base/pés

  // Posição no centro inferior do Canvas Pixi
  anim.x = canvasWidth.value / 2;
  anim.y = canvasHeight.value;

  const baseScale = props.scale || 1.35;
  anim.scale.x = props.flip ? -baseScale : baseScale;
  anim.scale.y = baseScale;

  anim.play();
  app.stage.addChild(anim);
  currentAnimSprite = anim;
}

watch(
  () => [props.character, props.state, props.flip, props.scale],
  () => {
    renderPixiAnimation();
  }
);

onMounted(async () => {
  if (!pixiContainer.value) return;

  app = new Application();
  await app.init({
    width: canvasWidth.value,
    height: canvasHeight.value,
    backgroundAlpha: 0, // Canvas 100% transparente
    antialias: false,   // Mantém a nitidez do pixel art do MUGEN
    preference: 'webgl',
  });

  if (pixiContainer.value && app.canvas) {
    pixiContainer.value.appendChild(app.canvas);
  }

  await renderPixiAnimation();
});

onUnmounted(() => {
  if (currentAnimSprite) {
    currentAnimSprite.destroy();
    currentAnimSprite = null;
  }
  if (app) {
    app.destroy(true, { children: true, texture: false });
    app = null;
  }
});
</script>

<style scoped>
.sprite-fighter canvas {
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}
</style>
