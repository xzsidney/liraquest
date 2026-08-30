import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { Application, Assets, AnimatedSprite, Texture } from 'pixi.js';
import mugenRegistry from '../../data/mugenRegistry.json';
const props = withDefaults(defineProps(), {
    character: 'capamerica',
    state: 'idle',
    flip: false,
    scale: 1.35,
});
const pixiContainer = ref(null);
let app = null;
let currentAnimSprite = null;
const loadedTexturesCache = {};
const canvasWidth = computed(() => (props.character === 'colossus' ? 180 : 150) * (props.scale || 1.35));
const canvasHeight = computed(() => (props.character === 'colossus' ? 200 : 170) * (props.scale || 1.35));
const activeFrames = computed(() => {
    const charKey = props.character.toLowerCase();
    const charData = mugenRegistry[charKey];
    if (charData) {
        if (props.state === 'idle')
            return charData.idle || ['0-0.png'];
        if (props.state === 'walk')
            return charData.walk || charData.idle;
        if (props.state === 'walkBack')
            return charData.walkBack || charData.walk || charData.idle;
        if (props.state === 'attack' || props.state === 'attackLight')
            return charData.attackLight || charData.idle;
        if (props.state === 'attackHeavy')
            return charData.attackHeavy || charData.attackLight || charData.idle;
        if (props.state === 'special')
            return charData.special || charData.attackHeavy || charData.idle;
        if (props.state === 'hit')
            return charData.hit || ['5000-0.png'];
        if (props.state === 'win')
            return charData.win || charData.idle;
    }
    return ['0-0.png'];
});
async function loadTexture(url) {
    if (loadedTexturesCache[url]) {
        return loadedTexturesCache[url];
    }
    try {
        const tex = await Assets.load(url);
        loadedTexturesCache[url] = tex;
        return tex;
    }
    catch (e) {
        console.error(`Erro ao carregar textura Pixi: ${url}`, e);
        return Texture.WHITE;
    }
}
async function renderPixiAnimation() {
    if (!app || !app.stage)
        return;
    const frames = activeFrames.value;
    if (!frames || frames.length === 0)
        return;
    const charKey = props.character.toLowerCase();
    const urls = frames.map(filename => `/sprites/${charKey}/${filename}`);
    const textures = [];
    for (const url of urls) {
        const tex = await loadTexture(url);
        textures.push(tex);
    }
    if (!app || !app.stage)
        return;
    if (currentAnimSprite) {
        app.stage.removeChild(currentAnimSprite);
        currentAnimSprite.destroy();
        currentAnimSprite = null;
    }
    const anim = new AnimatedSprite(textures);
    // Ajuste de velocidade do Pixi AnimatedSprite conforme o tipo de golpe
    if (props.state === 'attack' || props.state === 'attackLight' || props.state === 'attackHeavy') {
        anim.animationSpeed = 0.20;
    }
    else if (props.state === 'special') {
        anim.animationSpeed = 0.24;
    }
    else {
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
watch(() => [props.character, props.state, props.flip, props.scale], () => {
    renderPixiAnimation();
});
onMounted(async () => {
    if (!pixiContainer.value)
        return;
    app = new Application();
    await app.init({
        width: canvasWidth.value,
        height: canvasHeight.value,
        backgroundAlpha: 0, // Canvas 100% transparente
        antialias: false, // Mantém a nitidez do pixel art do MUGEN
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
const __VLS_defaults = {
    character: 'capamerica',
    state: 'idle',
    flip: false,
    scale: 1.35,
};
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ref: "pixiContainer",
    ...{ class: "sprite-fighter relative select-none pointer-events-none flex items-end justify-center" },
    ...{ style: ({
            width: `${__VLS_ctx.canvasWidth}px`,
            height: `${__VLS_ctx.canvasHeight}px`,
            filter: __VLS_ctx.state === 'hit' ? 'brightness(1.8) drop-shadow(0 0 10px rgba(239, 68, 68, 0.8))' : 'drop-shadow(0 4px 12px rgba(0,0,0,0.6))'
        }) },
});
/** @type {__VLS_StyleScopedClasses['sprite-fighter']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['select-none']} */ ;
/** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-end']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
// @ts-ignore
[canvasWidth, canvasHeight, state,];
const __VLS_export = (await import('vue')).defineComponent({
    __typeProps: {},
    props: {},
});
export default {};
