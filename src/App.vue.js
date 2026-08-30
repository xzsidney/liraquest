import { computed } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import MainFooter from './components/layout/MainFooter.vue';
const route = useRoute();
const showFooter = computed(() => {
    const isGameRoute = route.path.startsWith('/personagem') ||
        route.path.startsWith('/jogador') ||
        route.path.startsWith('/gm') ||
        route.path.includes('/radar') ||
        route.path.includes('/cronicas') ||
        route.path.includes('/visual-novel') ||
        route.path.includes('/aventuras');
    return !isGameRoute;
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "min-h-screen flex flex-col bg-bg-dark text-text-main font-sans" },
});
/** @type {__VLS_StyleScopedClasses['min-h-screen']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-bg-dark']} */ ;
/** @type {__VLS_StyleScopedClasses['text-text-main']} */ ;
/** @type {__VLS_StyleScopedClasses['font-sans']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex-1" },
    ...{ class: ({ 'h-screen overflow-hidden': !__VLS_ctx.showFooter }) },
});
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['h-screen']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.RouterView} */
RouterView;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({}));
const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
if (__VLS_ctx.showFooter) {
    const __VLS_5 = MainFooter;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({}));
    const __VLS_7 = __VLS_6({}, ...__VLS_functionalComponentArgsRest(__VLS_6));
}
// @ts-ignore
[showFooter, showFooter,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
