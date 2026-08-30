import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/LoginView.vue';
import FamilyPartyRoomView from '../views/family/FamilyPartyRoomView.vue';
import FamilyTasksView from '../views/family/FamilyTasksView.vue';
import FamilyBattleView from '../views/family/FamilyBattleView.vue';
import FamilyRaidView from '../views/family/FamilyRaidView.vue';
import FamilyShopView from '../views/family/FamilyShopView.vue';
import FamilyMasterView from '../views/family/FamilyMasterView.vue';
import FamilyHeroSheetView from '../views/family/FamilyHeroSheetView.vue';
import FamilyKingdomRadarView from '../views/family/FamilyKingdomRadarView.vue';
import FamilyActiveMissionView from '../views/family/FamilyActiveMissionView.vue';
import FamilyAdventuresView from '../views/family/FamilyAdventuresView.vue';
import FamilyFeedView from '../views/family/FamilyFeedView.vue';
import FamilyInfirmaryView from '../views/family/FamilyInfirmaryView.vue';
const routes = [
    {
        path: '/',
        redirect: '/familia/sala'
    },
    {
        path: '/login',
        name: 'login',
        component: LoginView
    },
    {
        path: '/familia/sala',
        alias: '/sala',
        name: 'family-room',
        component: FamilyPartyRoomView,
        meta: { requiresAuth: true }
    },
    {
        path: '/familia/tarefas',
        alias: '/tarefas',
        name: 'family-tasks',
        component: FamilyTasksView,
        meta: { requiresAuth: true }
    },
    {
        path: '/familia/batalha',
        alias: '/batalha',
        name: 'family-battle',
        component: FamilyBattleView,
        meta: { requiresAuth: true }
    },
    {
        path: '/familia/raid',
        alias: '/raid',
        name: 'family-raid',
        component: FamilyRaidView,
        meta: { requiresAuth: true }
    },
    {
        path: '/familia/loja',
        alias: '/loja',
        name: 'family-shop',
        component: FamilyShopView,
        meta: { requiresAuth: true }
    },
    {
        path: '/familia/mestre',
        alias: '/mestre',
        name: 'family-master',
        component: FamilyMasterView,
        meta: { requiresAuth: true }
    },
    {
        path: '/familia/ficha',
        alias: '/ficha',
        name: 'family-hero-sheet',
        component: FamilyHeroSheetView,
        meta: { requiresAuth: true }
    },
    {
        path: '/familia/radar',
        alias: '/radar',
        name: 'family-radar',
        component: FamilyKingdomRadarView,
        meta: { requiresAuth: true }
    },
    {
        path: '/familia/missao-ativa',
        alias: '/missao-ativa',
        name: 'family-active-mission',
        component: FamilyActiveMissionView,
        meta: { requiresAuth: true }
    },
    {
        path: '/familia/aventuras',
        alias: '/aventuras',
        name: 'family-adventures',
        component: FamilyAdventuresView,
        meta: { requiresAuth: true }
    },
    {
        path: '/familia/mural',
        alias: '/mural',
        name: 'family-feed',
        component: FamilyFeedView,
        meta: { requiresAuth: true }
    },
    {
        path: '/familia/enfermaria',
        alias: '/enfermaria',
        name: 'family-infirmary',
        component: FamilyInfirmaryView,
        meta: { requiresAuth: true }
    }
];
const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
});
router.beforeEach((to) => {
    const token = sessionStorage.getItem('lira_token') || localStorage.getItem('token') || localStorage.getItem('lira_token');
    if (to.meta.requiresAuth && !token) {
        return { name: 'login' };
    }
});
export default router;
