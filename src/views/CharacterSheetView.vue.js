import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import api, { API_BASE_URL } from '../services/api';
import DotRating from '../components/DotRating.vue';
const router = useRouter();
const route = useRoute();
const loading = ref(true);
const character = ref(null);
const characterId = ref('');
const fileInput = ref(null);
const uploading = ref(false);
const showAddModal = ref(null);
const allDisciplines = ref([]);
const allBackgrounds = ref([]);
const allMerits = ref([]);
const fetchDefinitions = async (type) => {
    try {
        if (type === 'discipline' && allDisciplines.value.length === 0) {
            const res = await api.get('/api/definition-disciplines');
            allDisciplines.value = res.data;
        }
        if (type === 'advantage' && allBackgrounds.value.length === 0) {
            const [bgRes, mfRes] = await Promise.all([
                api.get('/api/definition-backgrounds'),
                api.get('/api/definition-merit-flaws')
            ]);
            allBackgrounds.value = bgRes.data;
            allMerits.value = mfRes.data;
        }
        showAddModal.value = type;
    }
    catch (e) {
        console.error(e);
    }
};
const addNewDiscipline = (def) => {
    if (!character.value.CharacterVampireDisciplines)
        character.value.CharacterVampireDisciplines = [];
    if (character.value.CharacterVampireDisciplines.find((d) => d.definitionDisciplineId === def.id)) {
        showAddModal.value = null;
        return;
    }
    const newItem = {
        definitionDisciplineId: def.id,
        value: 0,
        DefinitionDiscipline: def
    };
    character.value.CharacterVampireDisciplines.push(newItem);
    xpCart.value.push({ isNewItem: true, arrayRef: character.value.CharacterVampireDisciplines, item: newItem });
    showAddModal.value = null;
};
const addNewAdvantage = (def, type) => {
    if (type === 'background') {
        if (!character.value.CharacterVampireBackgrounds)
            character.value.CharacterVampireBackgrounds = [];
        if (character.value.CharacterVampireBackgrounds.find((b) => b.definitionBackgroundId === def.id)) {
            showAddModal.value = null;
            return;
        }
        const newItem = {
            definitionBackgroundId: def.id,
            value: 0,
            DefinitionBackground: def
        };
        character.value.CharacterVampireBackgrounds.push(newItem);
        xpCart.value.push({ isNewItem: true, arrayRef: character.value.CharacterVampireBackgrounds, item: newItem });
    }
    else {
        if (!character.value.CharacterVampireMeritFlaws)
            character.value.CharacterVampireMeritFlaws = [];
        if (character.value.CharacterVampireMeritFlaws.find((m) => m.definitionMeritFlawId === def.id)) {
            showAddModal.value = null;
            return;
        }
        // Deduct XP immediately for merits
        if (def.type === 'QUALIDADE') {
            const cost = def.cost * 3;
            if (character.value.experienceTotal - character.value.experienceSpent - xpSpent.value < cost) {
                alert('Experiência insuficiente para essa Qualidade!');
                return;
            }
            xpSpent.value += cost;
        }
        const newItem = {
            definitionMeritFlawId: def.id,
            details: '',
            DefinitionMeritFlaw: def
        };
        character.value.CharacterVampireMeritFlaws.push(newItem);
        xpCart.value.push({ isNewItem: true, arrayRef: character.value.CharacterVampireMeritFlaws, item: newItem });
    }
    showAddModal.value = null;
};
const isXpMode = ref(false);
const xpSpent = ref(0);
const xpCart = ref([]);
const toggleXpMode = () => {
    if (isXpMode.value) {
        // Revert visual changes if cancelling
        xpCart.value.forEach(change => {
            if (change.isNewItem) {
                const idx = change.arrayRef.indexOf(change.item);
                if (idx > -1)
                    change.arrayRef.splice(idx, 1);
            }
            else {
                change.ref.value = change.old;
            }
        });
        xpSpent.value = 0;
        xpCart.value = [];
    }
    isXpMode.value = !isXpMode.value;
};
const confirmXpChanges = async () => {
    if (xpCart.value.length === 0)
        return toggleXpMode();
    try {
        const updatedTotalSpent = character.value.experienceSpent + xpSpent.value;
        await api.put('/api/character-vampires/' + characterId.value, {
            experienceSpent: updatedTotalSpent,
            attributes: character.value.CharacterVampireAttributes,
            skills: character.value.CharacterVampireSkills,
            disciplines: character.value.CharacterVampireDisciplines,
            backgrounds: character.value.CharacterVampireBackgrounds,
            meritsFlaws: character.value.CharacterVampireMeritFlaws
        });
        character.value.experienceSpent = updatedTotalSpent;
        xpSpent.value = 0;
        xpCart.value = [];
        alert('Evolução salva com sucesso!');
        toggleXpMode();
    }
    catch (e) {
        alert('Erro ao salvar evolução');
    }
};
const handleDotClick = (item, type, newLevel) => {
    if (!isXpMode.value)
        return;
    let oldLevel = item.value || 0;
    if (newLevel <= oldLevel)
        return;
    let costMultiplier = 0;
    if (type === 'attribute')
        costMultiplier = 5;
    else if (type === 'skill')
        costMultiplier = 3;
    else if (type === 'discipline')
        costMultiplier = 5;
    else if (type === 'advantage')
        costMultiplier = 3;
    let totalCost = 0;
    for (let l = oldLevel + 1; l <= newLevel; l++) {
        totalCost += l * costMultiplier;
    }
    const xpAvailable = character.value.experienceTotal - character.value.experienceSpent - xpSpent.value;
    if (totalCost > xpAvailable) {
        alert('Experiência insuficiente!');
        return;
    }
    item.value = newLevel;
    xpSpent.value += totalCost;
    xpCart.value.push({
        name: item.DefinitionAttribute?.name || item.DefinitionSkill?.name || item.DefinitionDiscipline?.name,
        cost: totalCost,
        old: oldLevel,
        new: newLevel,
        type,
        ref: item
    });
};
const confirmDelete = async () => {
    if (confirm('Tem certeza que deseja DELETAR este personagem para sempre?')) {
        try {
            await api.delete('/api/character-vampires/' + characterId.value);
            router.push('/jogador/vampire');
        }
        catch (e) {
            alert('Erro ao deletar personagem');
        }
    }
};
const triggerFileInput = () => {
    if (fileInput.value)
        fileInput.value.click();
};
const handleFileUpload = async (event) => {
    const target = event.target;
    if (target.files && target.files.length > 0) {
        const file = target.files[0];
        uploading.value = true;
        try {
            const formData = new FormData();
            formData.append('avatar', file);
            const res = await api.post('/api/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const newUrl = res.data.url;
            character.value.avatarUrl = newUrl;
            // Update DB
            await api.put(`/api/character-vampires/${characterId.value}`, {
                avatarUrl: newUrl
            });
        }
        catch (err) {
            alert('Erro ao enviar imagem. O arquivo pode ser muito grande ou inválido.');
        }
        finally {
            uploading.value = false;
        }
    }
};
const activeTab = ref('attributes');
const tabs = [
    { id: 'attributes', label: 'ATRIBUTOS' },
    { id: 'skills', label: 'HABILIDADES' },
    { id: 'disciplines', label: 'DISCIPLINAS' },
    { id: 'advantages', label: 'VANTAGENS' },
    { id: 'history', label: 'HISTÓRICO' },
    { id: 'equipment', label: 'COMBATE' }
];
const physicalAttrNames = ['Força', 'Destreza', 'Vigor', 'Strength', 'Dexterity', 'Stamina'];
const socialAttrNames = ['Carisma', 'Manipulação', 'Autocontrole', 'Charisma', 'Manipulation', 'Composure'];
const mentalAttrNames = ['Inteligência', 'Raciocínio', 'Perseverança', 'Determinação', 'Intelligence', 'Wits', 'Resolve'];
const attributeColumns = computed(() => {
    if (!character.value?.CharacterVampireAttributes)
        return [];
    const attrs = character.value.CharacterVampireAttributes;
    return [
        { title: 'Físicos', items: attrs.filter((a) => physicalAttrNames.includes(a.DefinitionAttribute?.name)) },
        { title: 'Sociais', items: attrs.filter((a) => socialAttrNames.includes(a.DefinitionAttribute?.name)) },
        { title: 'Mentais', items: attrs.filter((a) => mentalAttrNames.includes(a.DefinitionAttribute?.name)) }
    ];
});
const physicalSkillNames = ['Armas Brancas', 'Armas de Fogo', 'Atletismo', 'Briga', 'Condução', 'Furtividade', 'Ladroagem', 'Ofícios', 'Sobrevivência'];
const socialSkillNames = ['Empatia com Animais', 'Etiqueta', 'Intimidação', 'Liderança', 'Manha', 'Performance', 'Persuasão', 'Sagacidade', 'Subterfúgio'];
const mentalSkillNames = ['Ciência', 'Erudição', 'Finanças', 'Investigação', 'Medicina', 'Ocultismo', 'Percepção', 'Política', 'Tecnologia'];
const skillColumns = computed(() => {
    if (!character.value?.CharacterVampireSkills)
        return [];
    let skills = character.value.CharacterVampireSkills;
    // Sort alphabetically by name
    skills = [...skills].sort((a, b) => {
        const nameA = a.DefinitionSkill?.name || '';
        const nameB = b.DefinitionSkill?.name || '';
        return nameA.localeCompare(nameB);
    });
    return [
        { title: 'Físicas', items: skills.filter((s) => physicalSkillNames.includes(s.DefinitionSkill?.name)) },
        { title: 'Sociais', items: skills.filter((s) => socialSkillNames.includes(s.DefinitionSkill?.name)) },
        { title: 'Mentais', items: skills.filter((s) => mentalSkillNames.includes(s.DefinitionSkill?.name)) }
    ];
});
const fetchCharacter = async () => {
    try {
        const id = route.query.id || localStorage.getItem('lira_active_character_id');
        if (!id) {
            router.push('/jogador/vampire');
            return;
        }
        characterId.value = id;
        localStorage.setItem('lira_active_character_id', id);
        const res = await api.get(`/api/character-vampires/${id}`);
        character.value = res.data;
    }
    catch (err) {
        console.error('Erro ao buscar ficha:', err);
        router.push('/jogador/vampire');
    }
    finally {
        loading.value = false;
    }
};
const toggleEquipOnSheet = async (item) => {
    try {
        const res = await api.put(`/api/character-vampires/${characterId.value}/equipments/${item.definitionEquipmentId}/equip`);
        item.equipped = res.data.equipped ? 1 : 0;
    }
    catch (err) {
        console.error('Erro ao alternar equipamento:', err);
        alert('Não foi possível alternar o status do equipamento.');
    }
};
onMounted(() => {
    fetchCharacter();
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "min-h-screen pb-20" },
});
/** @type {__VLS_StyleScopedClasses['min-h-screen']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-20']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.nav, __VLS_intrinsics.nav)({
    ...{ class: "relative z-20 border-b border-border-dark bg-bg-deep/90 backdrop-blur-md sticky top-0" },
});
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['z-20']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['border-border-dark']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-bg-deep/90']} */ ;
/** @type {__VLS_StyleScopedClasses['backdrop-blur-md']} */ ;
/** @type {__VLS_StyleScopedClasses['sticky']} */ ;
/** @type {__VLS_StyleScopedClasses['top-0']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "max-w-[1300px] mx-auto px-6 h-14 flex items-center justify-between" },
});
/** @type {__VLS_StyleScopedClasses['max-w-[1300px]']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['px-6']} */ ;
/** @type {__VLS_StyleScopedClasses['h-14']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            return (__VLS_ctx.router.push('/jogador/vampire'));
            // @ts-ignore
            [router,];
        } },
    ...{ class: "text-gold hover:text-gold-bright flex items-center gap-2 font-serif uppercase tracking-widest text-xs transition-colors" },
});
/** @type {__VLS_StyleScopedClasses['text-gold']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-gold-bright']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
/** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "text-lg" },
});
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.confirmDelete) },
    ...{ class: "flex items-center gap-2 text-blood-red hover:text-red-500 transition-colors font-serif text-xs tracking-widest uppercase border border-blood-red/50 hover:border-red-500 px-3 py-1 rounded" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-blood-red']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-red-500']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
/** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-blood-red/50']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:border-red-500']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center gap-4" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.toggleXpMode) },
    ...{ class: "bg-gold-dim/10 hover:bg-gold-dim/20 text-gold-dim border border-gold-dim/50 px-4 py-1.5 rounded text-xs font-serif tracking-widest uppercase transition-all duration-300 flex items-center gap-2" },
});
/** @type {__VLS_StyleScopedClasses['bg-gold-dim/10']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-gold-dim/20']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gold-dim']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gold-dim/50']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
/** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "text-lg leading-none" },
});
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-none']} */ ;
(__VLS_ctx.isXpMode ? 'Sair da Evolução' : 'Evoluir');
if (__VLS_ctx.loading) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "relative z-10 max-w-[1300px] mx-auto px-6 py-20 text-center text-parchment-dim font-serif" },
    });
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-w-[1300px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-20']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-parchment-dim']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "animate-spin w-8 h-8 border-2 border-gold border-t-transparent rounded-full mx-auto mb-4" },
    });
    /** @type {__VLS_StyleScopedClasses['animate-spin']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-8']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-8']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-gold']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-t-transparent']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.main, __VLS_intrinsics.main)({
        ...{ class: "relative z-10 max-w-[1300px] mx-auto px-6 py-10" },
    });
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-w-[1300px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-10']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-1 md:grid-cols-[340px_1fr] gap-10 items-start" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['md:grid-cols-[340px_1fr]']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-start']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "sticky top-20" },
    });
    /** @type {__VLS_StyleScopedClasses['sticky']} */ ;
    /** @type {__VLS_StyleScopedClasses['top-20']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (__VLS_ctx.triggerFileInput) },
        ...{ class: "relative rounded-xl overflow-hidden border border-border-mid shadow-[0_8px_40px_rgba(0,0,0,0.8),0_0_30px_rgba(139,0,0,0.4)] group/avatar cursor-pointer" },
    });
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-border-mid']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-[0_8px_40px_rgba(0,0,0,0.8),0_0_30px_rgba(139,0,0,0.4)]']} */ ;
    /** @type {__VLS_StyleScopedClasses['group/avatar']} */ ;
    /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
        src: (__VLS_ctx.character?.avatarUrl ? (__VLS_ctx.character.avatarUrl.startsWith('http') ? __VLS_ctx.character.avatarUrl : __VLS_ctx.API_BASE_URL + __VLS_ctx.character.avatarUrl) : 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'600\'%3E%3Crect width=\'100%25\' height=\'100%25\' fill=\'%231a0b12\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' fill=\'%23c9a84c\' font-family=\'serif\' font-size=\'48\' dominant-baseline=\'middle\' text-anchor=\'middle\'%3E%E2%98%A5%3C/text%3E%3C/svg%3E'),
        ...{ class: "w-full object-cover saturate-90 transition-all duration-300 group-hover/avatar:saturate-100" },
    });
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['object-cover']} */ ;
    /** @type {__VLS_StyleScopedClasses['saturate-90']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
    /** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['group-hover/avatar:saturate-100']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300" },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black/50']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['opacity-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['group-hover/avatar:opacity-100']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-opacity']} */ ;
    /** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-gold font-serif text-sm tracking-widest uppercase mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['text-gold']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    if (__VLS_ctx.uploading) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "animate-spin w-5 h-5 border-2 border-gold border-t-transparent rounded-full mt-2" },
        });
        /** @type {__VLS_StyleScopedClasses['animate-spin']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-gold']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-t-transparent']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        ...{ onChange: (__VLS_ctx.handleFileUpload) },
        type: "file",
        ref: "fileInput",
        accept: "image/jpeg,image/png,image/webp",
        ...{ class: "hidden" },
    });
    /** @type {__VLS_StyleScopedClasses['hidden']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "absolute bottom-0 left-0 right-0 h-2/5 bg-gradient-to-t from-bg-deep to-transparent pointer-events-none" },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['bottom-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['left-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['right-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-2/5']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-gradient-to-t']} */ ;
    /** @type {__VLS_StyleScopedClasses['from-bg-deep']} */ ;
    /** @type {__VLS_StyleScopedClasses['to-transparent']} */ ;
    /** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "absolute bottom-0 left-0 right-0 p-5 z-10" },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['bottom-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['left-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['right-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-10']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex flex-col items-end gap-1 mb-3" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-end']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "font-serif text-[10px] tracking-widest text-parchment-dim uppercase" },
    });
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-parchment-dim']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    const __VLS_0 = DotRating;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        value: (__VLS_ctx.character?.humanity || 7),
        max: (10),
        color: "blood",
    }));
    const __VLS_2 = __VLS_1({
        value: (__VLS_ctx.character?.humanity || 7),
        max: (10),
        color: "blood",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mt-6 flex flex-col gap-4" },
    });
    /** @type {__VLS_StyleScopedClasses['mt-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "font-serif text-[10px] tracking-widest text-parchment-dim uppercase block mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-parchment-dim']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    const __VLS_5 = DotRating;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
        value: (__VLS_ctx.character?.healthMax || 0),
        max: (7),
        isBox: (true),
        color: "blood",
    }));
    const __VLS_7 = __VLS_6({
        value: (__VLS_ctx.character?.healthMax || 0),
        max: (7),
        isBox: (true),
        color: "blood",
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "font-serif text-[10px] tracking-widest text-parchment-dim uppercase block mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-parchment-dim']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    const __VLS_10 = DotRating;
    // @ts-ignore
    const __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({
        value: (__VLS_ctx.character?.willpowerMax || 0),
        max: (6),
        isBox: (true),
        color: "gold",
    }));
    const __VLS_12 = __VLS_11({
        value: (__VLS_ctx.character?.willpowerMax || 0),
        max: (6),
        isBox: (true),
        color: "gold",
    }, ...__VLS_functionalComponentArgsRest(__VLS_11));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-2 gap-2 mt-6" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-6']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "bg-gold/5 border border-border-dark rounded-lg p-3 text-center" },
    });
    /** @type {__VLS_StyleScopedClasses['bg-gold/5']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-border-dark']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "font-serif text-[9px] tracking-widest text-text-dim uppercase block mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-text-dim']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "font-serif text-2xl text-blood-bright drop-shadow-md" },
    });
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-blood-bright']} */ ;
    /** @type {__VLS_StyleScopedClasses['drop-shadow-md']} */ ;
    (__VLS_ctx.character?.hunger || 0);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "bg-gold/5 border border-border-dark rounded-lg p-3 text-center" },
    });
    /** @type {__VLS_StyleScopedClasses['bg-gold/5']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-border-dark']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "font-serif text-[9px] tracking-widest text-text-dim uppercase block mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-text-dim']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "font-serif text-2xl text-gold drop-shadow-md" },
    });
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gold']} */ ;
    /** @type {__VLS_StyleScopedClasses['drop-shadow-md']} */ ;
    (__VLS_ctx.character?.generation);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mt-6 border border-border-dark rounded-xl bg-bg-deep/50 overflow-hidden" },
    });
    /** @type {__VLS_StyleScopedClasses['mt-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-border-dark']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-bg-deep/50']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "bg-blood/10 px-4 py-2 border-b border-border-dark flex justify-between items-center" },
    });
    /** @type {__VLS_StyleScopedClasses['bg-blood/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-border-dark']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "font-serif text-[11px] tracking-widest text-blood-bright uppercase font-bold" },
    });
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-blood-bright']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    const __VLS_15 = DotRating;
    // @ts-ignore
    const __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
        value: (__VLS_ctx.character?.DefinitionBloodPotency?.level || 1),
        max: (10),
        color: "blood",
    }));
    const __VLS_17 = __VLS_16({
        value: (__VLS_ctx.character?.DefinitionBloodPotency?.level || 1),
        max: (10),
        color: "blood",
    }, ...__VLS_functionalComponentArgsRest(__VLS_16));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid grid-cols-2 text-[10px] divide-x divide-border-dark font-sans" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['divide-x']} */ ;
    /** @type {__VLS_StyleScopedClasses['divide-border-dark']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-sans']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "p-3 border-b border-border-dark" },
    });
    /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-border-dark']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-parchment-dim block mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['text-parchment-dim']} */ ;
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-gray-200" },
    });
    /** @type {__VLS_StyleScopedClasses['text-gray-200']} */ ;
    (__VLS_ctx.character?.DefinitionBloodPotency?.bloodSurge || '-');
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "p-3 border-b border-border-dark" },
    });
    /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-border-dark']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-parchment-dim block mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['text-parchment-dim']} */ ;
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-gray-200" },
    });
    /** @type {__VLS_StyleScopedClasses['text-gray-200']} */ ;
    (__VLS_ctx.character?.DefinitionBloodPotency?.mendAmount || '-');
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "p-3 border-b border-border-dark" },
    });
    /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-border-dark']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-parchment-dim block mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['text-parchment-dim']} */ ;
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-gray-200" },
    });
    /** @type {__VLS_StyleScopedClasses['text-gray-200']} */ ;
    (__VLS_ctx.character?.DefinitionBloodPotency?.disciplineBonus || '-');
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "p-3 border-b border-border-dark" },
    });
    /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-border-dark']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-parchment-dim block mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['text-parchment-dim']} */ ;
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-gray-200" },
    });
    /** @type {__VLS_StyleScopedClasses['text-gray-200']} */ ;
    (__VLS_ctx.character?.DefinitionBloodPotency?.feedingPenalty || '-');
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "p-3 col-span-2 text-center bg-black/20" },
    });
    /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['col-span-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black/20']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-parchment-dim block mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['text-parchment-dim']} */ ;
    /** @type {__VLS_StyleScopedClasses['block']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-purple-400 font-bold text-xs" },
    });
    /** @type {__VLS_StyleScopedClasses['text-purple-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    (__VLS_ctx.character?.DefinitionBloodPotency?.baneSeverity || 0);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mt-6 space-y-2" },
    });
    /** @type {__VLS_StyleScopedClasses['mt-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-end text-sm" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-end']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "font-serif text-gold-dim w-32 shrink-0" },
    });
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gold-dim']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-32']} */ ;
    /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex-1 border-b border-dashed border-white/20 mx-2 mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-dashed']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/20']} */ ;
    /** @type {__VLS_StyleScopedClasses['mx-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "font-mono text-gray-300 w-8 text-right" },
    });
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-8']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-right']} */ ;
    (__VLS_ctx.character?.experienceTotal || 0);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-end text-sm" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-end']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "font-serif text-gold-dim w-32 shrink-0" },
    });
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gold-dim']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-32']} */ ;
    /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex-1 border-b border-dashed border-white/20 mx-2 mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-dashed']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/20']} */ ;
    /** @type {__VLS_StyleScopedClasses['mx-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "font-mono text-gray-300 w-8 text-right" },
    });
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-8']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-right']} */ ;
    (__VLS_ctx.character?.experienceSpent || 0);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-end text-sm" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-end']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "font-serif text-green-400 w-32 shrink-0" },
    });
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-green-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-32']} */ ;
    /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex-1 border-b border-dashed border-white/20 mx-2 mb-1" },
    });
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-dashed']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/20']} */ ;
    /** @type {__VLS_StyleScopedClasses['mx-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "font-mono text-green-300 text-right" },
    });
    /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-green-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-right']} */ ;
    (Number(__VLS_ctx.character?.money || 0).toLocaleString('pt-BR'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "border-l-4 border-l-blood pl-5 mb-8" },
    });
    /** @type {__VLS_StyleScopedClasses['border-l-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-l-blood']} */ ;
    /** @type {__VLS_StyleScopedClasses['pl-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-8']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "inline-flex items-center gap-2 font-serif text-[11px] tracking-widest uppercase px-3 py-1 rounded-full border border-border-dark mb-3" },
    });
    /** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-border-dark']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.character?.DefinitionClan?.name || 'Sem Clã');
    __VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
        ...{ class: "font-serif text-4xl lg:text-5xl text-gold mb-2 drop-shadow-[0_0_20px_rgba(201,168,76,0.2)]" },
        ...{ style: {} },
    });
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-4xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['lg:text-5xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gold']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['drop-shadow-[0_0_20px_rgba(201,168,76,0.2)]']} */ ;
    (__VLS_ctx.character?.name);
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "font-sans italic text-[15px] text-parchment-dim mb-2" },
    });
    /** @type {__VLS_StyleScopedClasses['font-sans']} */ ;
    /** @type {__VLS_StyleScopedClasses['italic']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[15px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-parchment-dim']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
    (__VLS_ctx.character?.sire || 'Desconhecido');
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-gray-300 not-italic font-serif" },
    });
    /** @type {__VLS_StyleScopedClasses['text-gray-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['not-italic']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    (__VLS_ctx.character?.DefinitionPredator?.name || 'Desconhecido');
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "font-serif text-[15px] text-gray-300" },
    });
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[15px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-300']} */ ;
    (__VLS_ctx.character?.concept || 'Conceito não definido');
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex gap-0 border-b border-border-mid overflow-x-auto no-scrollbar mb-6" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-border-mid']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-x-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['no-scrollbar']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-6']} */ ;
    for (const [tab] of __VLS_vFor((__VLS_ctx.tabs))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        throw 0;
                    return (__VLS_ctx.activeTab = tab.id);
                    // @ts-ignore
                    [confirmDelete, toggleXpMode, isXpMode, loading, triggerFileInput, character, character, character, character, character, character, character, character, character, character, character, character, character, character, character, character, character, character, character, character, character, character, character, API_BASE_URL, uploading, handleFileUpload, tabs, activeTab,];
                } },
            key: (tab.id),
            ...{ class: "bg-transparent border-none border-b-2 border-transparent text-text-dim font-serif text-[11px] tracking-widest uppercase px-5 py-3 cursor-pointer whitespace-nowrap transition-all duration-300" },
            ...{ class: (__VLS_ctx.activeTab === tab.id ? 'text-gold border-b-gold drop-shadow-[0_0_10px_rgba(201,168,76,0.3)]' : 'hover:text-parchment') },
        });
        /** @type {__VLS_StyleScopedClasses['bg-transparent']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-none']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-b-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-transparent']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-text-dim']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
        /** @type {__VLS_StyleScopedClasses['whitespace-nowrap']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
        /** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
        (tab.label);
        // @ts-ignore
        [activeTab,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "min-h-[400px]" },
    });
    /** @type {__VLS_StyleScopedClasses['min-h-[400px]']} */ ;
    if (__VLS_ctx.activeTab === 'attributes') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-8 max-w-2xl" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-8']} */ ;
        /** @type {__VLS_StyleScopedClasses['max-w-2xl']} */ ;
        for (const [col] of __VLS_vFor((__VLS_ctx.attributeColumns))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                key: (col.title),
            });
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "font-serif text-[11px] tracking-[3px] uppercase text-gold-dim mb-6 flex items-center gap-4" },
            });
            /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['tracking-[3px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-gold-dim']} */ ;
            /** @type {__VLS_StyleScopedClasses['mb-6']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
            (col.title);
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex-1 h-px bg-gradient-to-r from-gold-dim/50 to-transparent" },
            });
            /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['h-px']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-gradient-to-r']} */ ;
            /** @type {__VLS_StyleScopedClasses['from-gold-dim/50']} */ ;
            /** @type {__VLS_StyleScopedClasses['to-transparent']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "space-y-3" },
            });
            /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
            for (const [attr] of __VLS_vFor((col.items))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    key: (attr.id),
                    ...{ class: "flex items-center" },
                });
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "font-serif text-[11px] tracking-widest text-text-main uppercase w-40 shrink-0" },
                });
                /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
                /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-text-main']} */ ;
                /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
                /** @type {__VLS_StyleScopedClasses['w-40']} */ ;
                /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
                (attr.DefinitionAttribute?.name);
                const __VLS_20 = DotRating;
                // @ts-ignore
                const __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({
                    ...{ 'onUpdate:value': {} },
                    value: (attr.value),
                    max: (5),
                    color: "gold",
                    interactive: (__VLS_ctx.isXpMode),
                }));
                const __VLS_22 = __VLS_21({
                    ...{ 'onUpdate:value': {} },
                    value: (attr.value),
                    max: (5),
                    color: "gold",
                    interactive: (__VLS_ctx.isXpMode),
                }, ...__VLS_functionalComponentArgsRest(__VLS_21));
                let __VLS_25;
                const __VLS_26 = {
                    /** @type {typeof __VLS_25.'update:value'} */
                    'onUpdate:value': (val => __VLS_ctx.handleDotClick(attr, 'attribute', val)),
                };
                var __VLS_23;
                var __VLS_24;
                // @ts-ignore
                [isXpMode, activeTab, attributeColumns, handleDotClick,];
            }
            // @ts-ignore
            [];
        }
    }
    if (__VLS_ctx.activeTab === 'skills') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "max-w-4xl" },
        });
        /** @type {__VLS_StyleScopedClasses['max-w-4xl']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "w-full h-px bg-gradient-to-r from-blood-red/80 via-blood-red/40 to-transparent mb-8" },
        });
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-px']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-gradient-to-r']} */ ;
        /** @type {__VLS_StyleScopedClasses['from-blood-red/80']} */ ;
        /** @type {__VLS_StyleScopedClasses['via-blood-red/40']} */ ;
        /** @type {__VLS_StyleScopedClasses['to-transparent']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-8']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-6" },
        });
        /** @type {__VLS_StyleScopedClasses['grid']} */ ;
        /** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['md:grid-cols-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-x-12']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-y-6']} */ ;
        for (const [col] of __VLS_vFor((__VLS_ctx.skillColumns))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                key: (col.title),
                ...{ class: "space-y-3" },
            });
            /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
            for (const [skill] of __VLS_vFor((col.items))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    key: (skill.id),
                    ...{ class: "flex items-center" },
                });
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "font-serif text-[11px] tracking-wide text-text-main capitalize truncate mr-2" },
                });
                /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
                /** @type {__VLS_StyleScopedClasses['tracking-wide']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-text-main']} */ ;
                /** @type {__VLS_StyleScopedClasses['capitalize']} */ ;
                /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
                /** @type {__VLS_StyleScopedClasses['mr-2']} */ ;
                (skill.DefinitionSkill?.name);
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "flex-1 border-b border-dashed border-white/20 mx-2 self-end mb-1" },
                });
                /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
                /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
                /** @type {__VLS_StyleScopedClasses['border-dashed']} */ ;
                /** @type {__VLS_StyleScopedClasses['border-white/20']} */ ;
                /** @type {__VLS_StyleScopedClasses['mx-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['self-end']} */ ;
                /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
                const __VLS_27 = DotRating;
                // @ts-ignore
                const __VLS_28 = __VLS_asFunctionalComponent1(__VLS_27, new __VLS_27({
                    ...{ 'onUpdate:value': {} },
                    value: (skill.value),
                    max: (5),
                    color: "gold",
                    ...{ class: "shrink-0" },
                    interactive: (__VLS_ctx.isXpMode),
                }));
                const __VLS_29 = __VLS_28({
                    ...{ 'onUpdate:value': {} },
                    value: (skill.value),
                    max: (5),
                    color: "gold",
                    ...{ class: "shrink-0" },
                    interactive: (__VLS_ctx.isXpMode),
                }, ...__VLS_functionalComponentArgsRest(__VLS_28));
                let __VLS_32;
                const __VLS_33 = {
                    /** @type {typeof __VLS_32.'update:value'} */
                    'onUpdate:value': (val => __VLS_ctx.handleDotClick(skill, 'skill', val)),
                };
                /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
                var __VLS_30;
                var __VLS_31;
                // @ts-ignore
                [isXpMode, activeTab, handleDotClick, skillColumns,];
            }
            // @ts-ignore
            [];
        }
    }
    if (__VLS_ctx.activeTab === 'disciplines') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-4" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
        if (!__VLS_ctx.character?.CharacterVampireDisciplines?.length && !__VLS_ctx.isXpMode) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "text-parchment-dim italic text-center py-10" },
            });
            /** @type {__VLS_StyleScopedClasses['text-parchment-dim']} */ ;
            /** @type {__VLS_StyleScopedClasses['italic']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-10']} */ ;
        }
        if (__VLS_ctx.isXpMode) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "mt-6 flex justify-center" },
            });
            /** @type {__VLS_StyleScopedClasses['mt-6']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.loading))
                            throw 0;
                        if (!(__VLS_ctx.activeTab === 'disciplines'))
                            throw 0;
                        if (!(__VLS_ctx.isXpMode))
                            throw 0;
                        return (__VLS_ctx.fetchDefinitions('discipline'));
                        // @ts-ignore
                        [isXpMode, isXpMode, character, activeTab, fetchDefinitions,];
                    } },
                ...{ class: "px-6 py-2 border border-dashed border-blood-red/50 text-blood-bright hover:bg-blood-red/10 rounded font-serif text-xs tracking-widest uppercase transition-colors" },
            });
            /** @type {__VLS_StyleScopedClasses['px-6']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-dashed']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-blood-red/50']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-blood-bright']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:bg-blood-red/10']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
            /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
        }
        for (const [disc] of __VLS_vFor((__VLS_ctx.character?.CharacterVampireDisciplines))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                key: (disc.id),
                ...{ class: "flex items-center gap-4 px-4 py-3 rounded-md bg-gold/5 border border-border-dark hover:border-gold-dim hover:bg-gold/10 transition-colors" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-gold/5']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-border-dark']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:border-gold-dim']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:bg-gold/10']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "font-serif text-[13px] tracking-wide text-parchment capitalize flex-1" },
            });
            /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-[13px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['tracking-wide']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
            /** @type {__VLS_StyleScopedClasses['capitalize']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
            (disc.DefinitionDiscipline?.name);
            const __VLS_34 = DotRating;
            // @ts-ignore
            const __VLS_35 = __VLS_asFunctionalComponent1(__VLS_34, new __VLS_34({
                ...{ 'onUpdate:value': {} },
                value: (disc.value),
                max: (5),
                color: "blue",
                interactive: (__VLS_ctx.isXpMode),
            }));
            const __VLS_36 = __VLS_35({
                ...{ 'onUpdate:value': {} },
                value: (disc.value),
                max: (5),
                color: "blue",
                interactive: (__VLS_ctx.isXpMode),
            }, ...__VLS_functionalComponentArgsRest(__VLS_35));
            let __VLS_39;
            const __VLS_40 = {
                /** @type {typeof __VLS_39.'update:value'} */
                'onUpdate:value': (val => __VLS_ctx.handleDotClick(disc, 'discipline', val)),
            };
            var __VLS_37;
            var __VLS_38;
            // @ts-ignore
            [isXpMode, character, handleDotClick,];
        }
    }
    if (__VLS_ctx.activeTab === 'advantages') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-6" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-6']} */ ;
        if (!(__VLS_ctx.character?.CharacterVampireBackgrounds?.length || __VLS_ctx.character?.CharacterVampireMeritFlaws?.length) && !__VLS_ctx.isXpMode) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "text-parchment-dim italic text-center py-10" },
            });
            /** @type {__VLS_StyleScopedClasses['text-parchment-dim']} */ ;
            /** @type {__VLS_StyleScopedClasses['italic']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-10']} */ ;
        }
        if (__VLS_ctx.isXpMode) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "mt-4 flex justify-center" },
            });
            /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.loading))
                            throw 0;
                        if (!(__VLS_ctx.activeTab === 'advantages'))
                            throw 0;
                        if (!(__VLS_ctx.isXpMode))
                            throw 0;
                        return (__VLS_ctx.fetchDefinitions('advantage'));
                        // @ts-ignore
                        [isXpMode, isXpMode, character, character, activeTab, fetchDefinitions,];
                    } },
                ...{ class: "px-6 py-2 border border-dashed border-gold-dim/50 text-gold-dim hover:bg-gold-dim/10 rounded font-serif text-xs tracking-widest uppercase transition-colors" },
            });
            /** @type {__VLS_StyleScopedClasses['px-6']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-dashed']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-gold-dim/50']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-gold-dim']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:bg-gold-dim/10']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
            /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "grid grid-cols-1 md:grid-cols-2 gap-6" },
        });
        /** @type {__VLS_StyleScopedClasses['grid']} */ ;
        /** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['md:grid-cols-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-6']} */ ;
        if (__VLS_ctx.character?.CharacterVampireBackgrounds?.length) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "bg-gold/5 border border-border-dark rounded-xl p-6 md:col-span-2" },
            });
            /** @type {__VLS_StyleScopedClasses['bg-gold/5']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-border-dark']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
            /** @type {__VLS_StyleScopedClasses['p-6']} */ ;
            /** @type {__VLS_StyleScopedClasses['md:col-span-2']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
                ...{ class: "font-serif text-[13px] tracking-wide text-gold mb-4" },
            });
            /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-[13px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['tracking-wide']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-gold']} */ ;
            /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" },
            });
            /** @type {__VLS_StyleScopedClasses['grid']} */ ;
            /** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['sm:grid-cols-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['lg:grid-cols-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
            for (const [bg] of __VLS_vFor((__VLS_ctx.character.CharacterVampireBackgrounds))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    key: (bg.id),
                    ...{ class: "bg-black/30 p-3 rounded border border-white/5" },
                });
                /** @type {__VLS_StyleScopedClasses['bg-black/30']} */ ;
                /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
                /** @type {__VLS_StyleScopedClasses['border']} */ ;
                /** @type {__VLS_StyleScopedClasses['border-white/5']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "flex justify-between items-center mb-1" },
                });
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "font-serif text-[11px] uppercase text-gray-200" },
                });
                /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
                /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-gray-200']} */ ;
                (bg.DefinitionBackground?.name);
                const __VLS_41 = DotRating;
                // @ts-ignore
                const __VLS_42 = __VLS_asFunctionalComponent1(__VLS_41, new __VLS_41({
                    ...{ 'onUpdate:value': {} },
                    value: (bg.value),
                    max: (5),
                    color: "gold",
                    interactive: (__VLS_ctx.isXpMode),
                }));
                const __VLS_43 = __VLS_42({
                    ...{ 'onUpdate:value': {} },
                    value: (bg.value),
                    max: (5),
                    color: "gold",
                    interactive: (__VLS_ctx.isXpMode),
                }, ...__VLS_functionalComponentArgsRest(__VLS_42));
                let __VLS_46;
                const __VLS_47 = {
                    /** @type {typeof __VLS_46.'update:value'} */
                    'onUpdate:value': (val => __VLS_ctx.handleDotClick(bg, 'advantage', val)),
                };
                var __VLS_44;
                var __VLS_45;
                __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                    ...{ class: "text-[10px] text-gray-500 leading-tight" },
                });
                /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
                /** @type {__VLS_StyleScopedClasses['leading-tight']} */ ;
                (bg.DefinitionBackground?.description);
                // @ts-ignore
                [isXpMode, character, character, handleDotClick,];
            }
        }
        if (__VLS_ctx.character?.CharacterVampireMeritFlaws?.length) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "bg-gold/5 border border-border-dark rounded-xl p-6 md:col-span-2" },
            });
            /** @type {__VLS_StyleScopedClasses['bg-gold/5']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-border-dark']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
            /** @type {__VLS_StyleScopedClasses['p-6']} */ ;
            /** @type {__VLS_StyleScopedClasses['md:col-span-2']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
                ...{ class: "font-serif text-[13px] tracking-wide text-gold mb-4" },
            });
            /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-[13px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['tracking-wide']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-gold']} */ ;
            /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)({
                ...{ class: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" },
            });
            /** @type {__VLS_StyleScopedClasses['grid']} */ ;
            /** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['sm:grid-cols-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['lg:grid-cols-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
            for (const [mf] of __VLS_vFor((__VLS_ctx.character.CharacterVampireMeritFlaws))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
                    key: (mf.id),
                    ...{ class: "flex justify-between items-start bg-black/30 p-3 rounded border border-white/5" },
                });
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-start']} */ ;
                /** @type {__VLS_StyleScopedClasses['bg-black/30']} */ ;
                /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
                /** @type {__VLS_StyleScopedClasses['border']} */ ;
                /** @type {__VLS_StyleScopedClasses['border-white/5']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "font-serif text-[11px] uppercase" },
                    ...{ class: (mf.DefinitionMeritFlaw?.type === 'QUALIDADE' ? 'text-green-400' : 'text-blood-red') },
                });
                /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
                /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
                (mf.DefinitionMeritFlaw?.name);
                __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                    ...{ class: "text-[10px] text-gray-500 mt-1 leading-tight" },
                });
                /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
                /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
                /** @type {__VLS_StyleScopedClasses['leading-tight']} */ ;
                (mf.DefinitionMeritFlaw?.description);
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "font-mono text-xs ml-2" },
                    ...{ class: (mf.DefinitionMeritFlaw?.type === 'QUALIDADE' ? 'text-green-400' : 'text-blood-red') },
                });
                /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                /** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
                (mf.DefinitionMeritFlaw?.type === 'QUALIDADE' ? '+' : '-');
                (mf.DefinitionMeritFlaw?.cost);
                // @ts-ignore
                [character, character,];
            }
        }
    }
    if (__VLS_ctx.activeTab === 'history') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-8 max-w-4xl" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-8']} */ ;
        /** @type {__VLS_StyleScopedClasses['max-w-4xl']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-4" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "font-serif text-[11px] tracking-[3px] uppercase text-gold-dim mb-4 flex items-center gap-4" },
        });
        /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['tracking-[3px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-gold-dim']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex-1 h-px bg-gradient-to-r from-gold-dim/50 to-transparent" },
        });
        /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-px']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-gradient-to-r']} */ ;
        /** @type {__VLS_StyleScopedClasses['from-gold-dim/50']} */ ;
        /** @type {__VLS_StyleScopedClasses['to-transparent']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "bg-[#0f0a0a] border border-white/5 rounded-xl p-6 leading-relaxed text-[0.95rem] text-gray-300" },
        });
        /** @type {__VLS_StyleScopedClasses['bg-[#0f0a0a]']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-white/5']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-6']} */ ;
        /** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[0.95rem]']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-gray-300']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "whitespace-pre-wrap font-serif" },
        });
        /** @type {__VLS_StyleScopedClasses['whitespace-pre-wrap']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
        (__VLS_ctx.character?.history || 'Sua história ainda será escrita nas sombras.');
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-4" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "font-serif text-[11px] tracking-[3px] uppercase text-gold-dim mb-4 flex items-center gap-4" },
        });
        /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['tracking-[3px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-gold-dim']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex-1 h-px bg-gradient-to-r from-gold-dim/50 to-transparent" },
        });
        /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-px']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-gradient-to-r']} */ ;
        /** @type {__VLS_StyleScopedClasses['from-gold-dim/50']} */ ;
        /** @type {__VLS_StyleScopedClasses['to-transparent']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "bg-[#120505] border border-blood-red/20 rounded-xl p-6" },
        });
        /** @type {__VLS_StyleScopedClasses['bg-[#120505]']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-blood-red/20']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-6']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center gap-2 mb-3" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-xs" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
            ...{ class: "font-serif text-[10px] tracking-widest text-blood-bright uppercase" },
        });
        /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-blood-bright']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-2 text-[0.88rem] text-gray-300 font-serif italic" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[0.88rem]']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-gray-300']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
        /** @type {__VLS_StyleScopedClasses['italic']} */ ;
        if (__VLS_ctx.character?.concept) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({
                ...{ class: "text-gold-dim not-italic" },
            });
            /** @type {__VLS_StyleScopedClasses['text-gold-dim']} */ ;
            /** @type {__VLS_StyleScopedClasses['not-italic']} */ ;
            (__VLS_ctx.character.concept);
        }
        if (__VLS_ctx.character?.ambition) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({
                ...{ class: "text-gold-dim not-italic" },
            });
            /** @type {__VLS_StyleScopedClasses['text-gold-dim']} */ ;
            /** @type {__VLS_StyleScopedClasses['not-italic']} */ ;
            (__VLS_ctx.character.ambition);
        }
        if (__VLS_ctx.character?.desire) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({
                ...{ class: "text-gold-dim not-italic" },
            });
            /** @type {__VLS_StyleScopedClasses['text-gold-dim']} */ ;
            /** @type {__VLS_StyleScopedClasses['not-italic']} */ ;
            (__VLS_ctx.character.desire);
        }
        if (!__VLS_ctx.character?.concept && !__VLS_ctx.character?.ambition && !__VLS_ctx.character?.desire) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
        }
        if (__VLS_ctx.character?.DefinitionClan?.weakness) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "space-y-4" },
            });
            /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "font-serif text-[11px] tracking-[3px] uppercase text-gold-dim mb-4 flex items-center gap-4" },
            });
            /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['tracking-[3px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-gold-dim']} */ ;
            /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex-1 h-px bg-gradient-to-r from-gold-dim/50 to-transparent" },
            });
            /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['h-px']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-gradient-to-r']} */ ;
            /** @type {__VLS_StyleScopedClasses['from-gold-dim/50']} */ ;
            /** @type {__VLS_StyleScopedClasses['to-transparent']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "bg-[#0c0812] border border-purple-900/30 rounded-xl p-6" },
            });
            /** @type {__VLS_StyleScopedClasses['bg-[#0c0812]']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-purple-900/30']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
            /** @type {__VLS_StyleScopedClasses['p-6']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex items-center gap-2 mb-3" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-xs text-purple-400" },
            });
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-purple-400']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
                ...{ class: "font-serif text-[10px] tracking-widest text-purple-400 uppercase" },
            });
            /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-purple-400']} */ ;
            /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "font-serif text-[0.88rem] text-gray-300 leading-relaxed whitespace-pre-wrap" },
            });
            /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-[0.88rem]']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-gray-300']} */ ;
            /** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
            /** @type {__VLS_StyleScopedClasses['whitespace-pre-wrap']} */ ;
            (__VLS_ctx.character.DefinitionClan.weakness);
        }
    }
    if (__VLS_ctx.activeTab === 'equipment') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-8 max-w-4xl animate-fade-in" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-8']} */ ;
        /** @type {__VLS_StyleScopedClasses['max-w-4xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['animate-fade-in']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-white/10" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:flex-row']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['pb-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "font-serif text-[11px] tracking-[3px] uppercase text-gold-dim flex items-center gap-4" },
        });
        /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['tracking-[3px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-gold-dim']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex-1 h-px bg-gradient-to-r from-gold-dim/50 to-transparent hidden sm:block" },
        });
        /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-px']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-gradient-to-r']} */ ;
        /** @type {__VLS_StyleScopedClasses['from-gold-dim/50']} */ ;
        /** @type {__VLS_StyleScopedClasses['to-transparent']} */ ;
        /** @type {__VLS_StyleScopedClasses['hidden']} */ ;
        /** @type {__VLS_StyleScopedClasses['sm:block']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-xs text-stone-400 font-sans mt-1" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-stone-400']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-sans']} */ ;
        /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        throw 0;
                    if (!(__VLS_ctx.activeTab === 'equipment'))
                        throw 0;
                    return (__VLS_ctx.router.push('/personagem/inventario?id=' + __VLS_ctx.characterId));
                    // @ts-ignore
                    [router, character, character, character, character, character, character, character, character, character, character, character, character, activeTab, activeTab, characterId,];
                } },
            ...{ class: "px-4 py-2 bg-gold/15 hover:bg-gold/30 border border-gold/40 text-gold text-xs font-serif uppercase tracking-widest rounded transition-all shrink-0 flex items-center gap-1.5 shadow-[0_0_15px_rgba(212,175,55,0.15)]" },
        });
        /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-gold/15']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:bg-gold/30']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-gold/40']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-gold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
        /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['shadow-[0_0_15px_rgba(212,175,55,0.15)]']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-4" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
            ...{ class: "font-serif text-xs text-gold uppercase tracking-widest font-bold flex items-center gap-2" },
        });
        /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-gold']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        if (__VLS_ctx.character?.CharacterVampireEquipments?.filter((e) => e.equipped).length) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "grid grid-cols-1 md:grid-cols-2 gap-4" },
            });
            /** @type {__VLS_StyleScopedClasses['grid']} */ ;
            /** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['md:grid-cols-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
            for (const [item] of __VLS_vFor((__VLS_ctx.character.CharacterVampireEquipments.filter((e) => e.equipped)))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    key: (item.id),
                    ...{ class: "bg-black/60 border-2 border-blood-red/70 rounded-xl p-5 shadow-[0_0_20px_rgba(185,28,28,0.2)] flex flex-col justify-between space-y-3" },
                });
                /** @type {__VLS_StyleScopedClasses['bg-black/60']} */ ;
                /** @type {__VLS_StyleScopedClasses['border-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['border-blood-red/70']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
                /** @type {__VLS_StyleScopedClasses['p-5']} */ ;
                /** @type {__VLS_StyleScopedClasses['shadow-[0_0_20px_rgba(185,28,28,0.2)]']} */ ;
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
                /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
                /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "flex justify-between items-start mb-1.5" },
                });
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-start']} */ ;
                /** @type {__VLS_StyleScopedClasses['mb-1.5']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "text-[10px] font-serif uppercase tracking-widest text-gold-dim" },
                });
                /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
                /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
                /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-gold-dim']} */ ;
                (item.DefinitionEquipment?.type);
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "text-[9px] font-mono uppercase bg-blood-red/30 text-blood-bright border border-blood-red/60 px-2 py-0.5 rounded font-bold" },
                });
                /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
                /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
                /** @type {__VLS_StyleScopedClasses['bg-blood-red/30']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-blood-bright']} */ ;
                /** @type {__VLS_StyleScopedClasses['border']} */ ;
                /** @type {__VLS_StyleScopedClasses['border-blood-red/60']} */ ;
                /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({
                    ...{ class: "font-serif text-base text-parchment font-bold" },
                });
                /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-parchment']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
                (item.DefinitionEquipment?.name);
                __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                    ...{ class: "text-xs text-stone-400 font-light mt-1 line-clamp-2 leading-relaxed" },
                });
                /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-stone-400']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-light']} */ ;
                /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
                /** @type {__VLS_StyleScopedClasses['line-clamp-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
                (item.DefinitionEquipment?.description);
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "grid grid-cols-2 gap-2 text-[11px] font-mono bg-black/40 p-2.5 rounded border border-white/5 text-stone-300" },
                });
                /** @type {__VLS_StyleScopedClasses['grid']} */ ;
                /** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
                /** @type {__VLS_StyleScopedClasses['bg-black/40']} */ ;
                /** @type {__VLS_StyleScopedClasses['p-2.5']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
                /** @type {__VLS_StyleScopedClasses['border']} */ ;
                /** @type {__VLS_StyleScopedClasses['border-white/5']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-stone-300']} */ ;
                if (item.DefinitionEquipment?.damage) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
                    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({
                        ...{ class: "text-red-400" },
                    });
                    /** @type {__VLS_StyleScopedClasses['text-red-400']} */ ;
                    (item.DefinitionEquipment.damage);
                }
                if (item.DefinitionEquipment?.armorLevel) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
                    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({
                        ...{ class: "text-gold" },
                    });
                    /** @type {__VLS_StyleScopedClasses['text-gold']} */ ;
                    (item.DefinitionEquipment.armorLevel);
                }
                if (item.DefinitionEquipment?.range) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
                    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
                    (item.DefinitionEquipment.range);
                }
                if (item.DefinitionEquipment?.concealment) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
                    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
                    (item.DefinitionEquipment.concealment);
                }
                __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                    ...{ onClick: (...[$event]) => {
                            if (!!(__VLS_ctx.loading))
                                throw 0;
                            if (!(__VLS_ctx.activeTab === 'equipment'))
                                throw 0;
                            if (!(__VLS_ctx.character?.CharacterVampireEquipments?.filter((e) => e.equipped).length))
                                throw 0;
                            return (__VLS_ctx.toggleEquipOnSheet(item));
                            // @ts-ignore
                            [character, character, toggleEquipOnSheet,];
                        } },
                    ...{ class: "w-full py-1.5 rounded border border-white/10 hover:bg-white/10 text-stone-400 hover:text-white text-xs font-serif uppercase tracking-wider transition-all" },
                });
                /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
                /** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
                /** @type {__VLS_StyleScopedClasses['border']} */ ;
                /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
                /** @type {__VLS_StyleScopedClasses['hover:bg-white/10']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-stone-400']} */ ;
                /** @type {__VLS_StyleScopedClasses['hover:text-white']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
                /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
                /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
                /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
                // @ts-ignore
                [];
            }
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "p-6 text-center text-xs text-stone-500 font-serif italic border border-white/5 rounded-xl bg-black/20" },
            });
            /** @type {__VLS_StyleScopedClasses['p-6']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-stone-500']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
            /** @type {__VLS_StyleScopedClasses['italic']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-white/5']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-black/20']} */ ;
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-4 pt-4 border-t border-white/5" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['pt-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-white/5']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
            ...{ class: "font-serif text-xs text-stone-300 uppercase tracking-widest font-bold flex items-center gap-2" },
        });
        /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-stone-300']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        if (__VLS_ctx.character?.CharacterVampireEquipments?.filter((e) => !e.equipped).length) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "grid grid-cols-1 md:grid-cols-2 gap-4" },
            });
            /** @type {__VLS_StyleScopedClasses['grid']} */ ;
            /** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['md:grid-cols-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
            for (const [item] of __VLS_vFor((__VLS_ctx.character.CharacterVampireEquipments.filter((e) => !e.equipped)))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    key: (item.id),
                    ...{ class: "bg-black/40 border border-white/10 hover:border-white/20 rounded-xl p-4 flex flex-col justify-between space-y-3" },
                });
                /** @type {__VLS_StyleScopedClasses['bg-black/40']} */ ;
                /** @type {__VLS_StyleScopedClasses['border']} */ ;
                /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
                /** @type {__VLS_StyleScopedClasses['hover:border-white/20']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
                /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
                /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
                /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "flex justify-between items-start mb-1" },
                });
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-start']} */ ;
                /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "text-[10px] font-serif uppercase tracking-widest text-stone-500" },
                });
                /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
                /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
                /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-stone-500']} */ ;
                (item.DefinitionEquipment?.type);
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "text-[9px] font-mono text-stone-500" },
                });
                /** @type {__VLS_StyleScopedClasses['text-[9px]']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-stone-500']} */ ;
                (item.quantity);
                __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({
                    ...{ class: "font-serif text-sm text-stone-200 font-bold" },
                });
                /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-stone-200']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
                (item.DefinitionEquipment?.name);
                __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                    ...{ class: "text-xs text-stone-400 font-light mt-1 line-clamp-2 leading-relaxed" },
                });
                /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-stone-400']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-light']} */ ;
                /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
                /** @type {__VLS_StyleScopedClasses['line-clamp-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
                (item.DefinitionEquipment?.description);
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "flex items-center justify-between text-[11px] font-mono text-stone-400 pt-1" },
                });
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-[11px]']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-stone-400']} */ ;
                /** @type {__VLS_StyleScopedClasses['pt-1']} */ ;
                if (item.DefinitionEquipment?.damage) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
                    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({
                        ...{ class: "text-red-400" },
                    });
                    /** @type {__VLS_StyleScopedClasses['text-red-400']} */ ;
                    (item.DefinitionEquipment.damage);
                }
                if (item.DefinitionEquipment?.armorLevel) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
                    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({
                        ...{ class: "text-gold" },
                    });
                    /** @type {__VLS_StyleScopedClasses['text-gold']} */ ;
                    (item.DefinitionEquipment.armorLevel);
                }
                __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                    ...{ onClick: (...[$event]) => {
                            if (!!(__VLS_ctx.loading))
                                throw 0;
                            if (!(__VLS_ctx.activeTab === 'equipment'))
                                throw 0;
                            if (!(__VLS_ctx.character?.CharacterVampireEquipments?.filter((e) => !e.equipped).length))
                                throw 0;
                            return (__VLS_ctx.toggleEquipOnSheet(item));
                            // @ts-ignore
                            [character, character, toggleEquipOnSheet,];
                        } },
                    ...{ class: "w-full py-1.5 rounded bg-blood-red/70 hover:bg-blood-red text-white text-xs font-serif uppercase tracking-wider transition-all" },
                });
                /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
                /** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
                /** @type {__VLS_StyleScopedClasses['bg-blood-red/70']} */ ;
                /** @type {__VLS_StyleScopedClasses['hover:bg-blood-red']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
                /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
                /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
                /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
                // @ts-ignore
                [];
            }
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "p-6 text-center text-xs text-stone-500 font-serif italic border border-white/5 rounded-xl bg-black/20" },
            });
            /** @type {__VLS_StyleScopedClasses['p-6']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-stone-500']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
            /** @type {__VLS_StyleScopedClasses['italic']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-white/5']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-black/20']} */ ;
        }
    }
}
if (__VLS_ctx.isXpMode) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "fixed bottom-0 left-0 right-0 bg-black/90 border-t border-gold-dim backdrop-blur-md z-50 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.8)]" },
    });
    /** @type {__VLS_StyleScopedClasses['fixed']} */ ;
    /** @type {__VLS_StyleScopedClasses['bottom-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['left-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['right-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black/90']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-gold-dim']} */ ;
    /** @type {__VLS_StyleScopedClasses['backdrop-blur-md']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-[0_-10px_40px_rgba(0,0,0,0.8)]']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "max-w-[1300px] mx-auto flex items-center justify-between" },
    });
    /** @type {__VLS_StyleScopedClasses['max-w-[1300px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center gap-6" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-6']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-gold-dim font-serif uppercase tracking-widest text-xs border-r border-white/10 pr-6" },
    });
    /** @type {__VLS_StyleScopedClasses['text-gold-dim']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-r']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
    /** @type {__VLS_StyleScopedClasses['pr-6']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-white text-lg ml-2" },
    });
    /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
    (__VLS_ctx.character?.experienceTotal - __VLS_ctx.character?.experienceSpent - __VLS_ctx.xpSpent);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-gray-400 text-xs font-sans" },
    });
    /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-sans']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-white" },
    });
    /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
    (__VLS_ctx.xpSpent);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex gap-4" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.toggleXpMode) },
        ...{ class: "px-6 py-2 border border-white/20 text-gray-300 rounded font-serif uppercase tracking-widest text-xs hover:bg-white/5 transition-colors" },
    });
    /** @type {__VLS_StyleScopedClasses['px-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-white/20']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gray-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-white/5']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.confirmXpChanges) },
        ...{ class: "px-6 py-2 bg-gold-dim text-black font-bold rounded font-serif uppercase tracking-widest text-xs hover:bg-gold transition-colors" },
    });
    /** @type {__VLS_StyleScopedClasses['px-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-gold-dim']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-gold']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
}
if (__VLS_ctx.showAddModal) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4" },
    });
    /** @type {__VLS_StyleScopedClasses['fixed']} */ ;
    /** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black/80']} */ ;
    /** @type {__VLS_StyleScopedClasses['backdrop-blur-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-[100]']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "bg-bg-deep border border-border-dark rounded-xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl" },
    });
    /** @type {__VLS_StyleScopedClasses['bg-bg-deep']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-border-dark']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-w-md']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-h-[80vh]']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-2xl']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "p-4 border-b border-border-dark flex justify-between items-center bg-black/40" },
    });
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-border-dark']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black/40']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
        ...{ class: "font-serif text-gold text-lg uppercase tracking-widest" },
    });
    /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-gold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
    (__VLS_ctx.showAddModal === 'discipline' ? 'Disciplina' : 'Vantagem');
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showAddModal))
                    throw 0;
                return (__VLS_ctx.showAddModal = null);
                // @ts-ignore
                [toggleXpMode, isXpMode, character, character, xpSpent, xpSpent, confirmXpChanges, showAddModal, showAddModal, showAddModal,];
            } },
        ...{ class: "text-gray-500 hover:text-white" },
    });
    /** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:text-white']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "p-4 overflow-y-auto flex-1 space-y-2 custom-scrollbar" },
    });
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['custom-scrollbar']} */ ;
    if (__VLS_ctx.showAddModal === 'discipline') {
        for (const [disc] of __VLS_vFor((__VLS_ctx.allDisciplines))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.showAddModal))
                            throw 0;
                        if (!(__VLS_ctx.showAddModal === 'discipline'))
                            throw 0;
                        return (__VLS_ctx.addNewDiscipline(disc));
                        // @ts-ignore
                        [showAddModal, allDisciplines, addNewDiscipline,];
                    } },
                key: (disc.id),
                ...{ class: "p-3 border border-white/5 rounded bg-white/5 hover:bg-blood/20 cursor-pointer transition-colors group" },
            });
            /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-white/5']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-white/5']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:bg-blood/20']} */ ;
            /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
            /** @type {__VLS_StyleScopedClasses['group']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({
                ...{ class: "font-serif text-blood-bright text-sm tracking-wide group-hover:text-white" },
            });
            /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-blood-bright']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['tracking-wide']} */ ;
            /** @type {__VLS_StyleScopedClasses['group-hover:text-white']} */ ;
            (disc.name);
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "text-xs text-gray-400 mt-1 truncate" },
            });
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
            /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
            (disc.description);
            // @ts-ignore
            [];
        }
    }
    if (__VLS_ctx.showAddModal === 'advantage') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mb-4" },
        });
        /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({
            ...{ class: "font-serif text-gold-dim text-xs tracking-widest uppercase mb-2 border-b border-white/10 pb-1" },
        });
        /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-gold-dim']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
        /** @type {__VLS_StyleScopedClasses['pb-1']} */ ;
        for (const [bg] of __VLS_vFor((__VLS_ctx.allBackgrounds))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.showAddModal))
                            throw 0;
                        if (!(__VLS_ctx.showAddModal === 'advantage'))
                            throw 0;
                        return (__VLS_ctx.addNewAdvantage(bg, 'background'));
                        // @ts-ignore
                        [showAddModal, allBackgrounds, addNewAdvantage,];
                    } },
                key: ('bg' + bg.id),
                ...{ class: "p-3 border border-white/5 rounded bg-white/5 hover:bg-gold-dim/20 cursor-pointer transition-colors group mb-2" },
            });
            /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-white/5']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-white/5']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:bg-gold-dim/20']} */ ;
            /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
            /** @type {__VLS_StyleScopedClasses['group']} */ ;
            /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({
                ...{ class: "font-serif text-gold text-sm tracking-wide group-hover:text-white" },
            });
            /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-gold']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['tracking-wide']} */ ;
            /** @type {__VLS_StyleScopedClasses['group-hover:text-white']} */ ;
            (bg.name);
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "text-xs text-gray-400 mt-1 truncate" },
            });
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
            /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
            (bg.description);
            // @ts-ignore
            [];
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({
            ...{ class: "font-serif text-gold-dim text-xs tracking-widest uppercase mb-2 border-b border-white/10 pb-1" },
        });
        /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-gold-dim']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['tracking-widest']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-white/10']} */ ;
        /** @type {__VLS_StyleScopedClasses['pb-1']} */ ;
        for (const [mf] of __VLS_vFor((__VLS_ctx.allMerits))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.showAddModal))
                            throw 0;
                        if (!(__VLS_ctx.showAddModal === 'advantage'))
                            throw 0;
                        return (__VLS_ctx.addNewAdvantage(mf, 'merit'));
                        // @ts-ignore
                        [addNewAdvantage, allMerits,];
                    } },
                key: ('mf' + mf.id),
                ...{ class: "p-3 border border-white/5 rounded bg-white/5 hover:bg-gold-dim/20 cursor-pointer transition-colors group mb-2" },
            });
            /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-white/5']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-white/5']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:bg-gold-dim/20']} */ ;
            /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
            /** @type {__VLS_StyleScopedClasses['group']} */ ;
            /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({
                ...{ class: "font-serif text-sm tracking-wide group-hover:text-white" },
                ...{ class: (mf.type === 'QUALIDADE' ? 'text-green-400' : 'text-blood-red') },
            });
            /** @type {__VLS_StyleScopedClasses['font-serif']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['tracking-wide']} */ ;
            /** @type {__VLS_StyleScopedClasses['group-hover:text-white']} */ ;
            (mf.type);
            (mf.name);
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "text-xs text-gray-400 mt-1 truncate" },
            });
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
            /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
            (mf.description);
            // @ts-ignore
            [];
        }
    }
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
