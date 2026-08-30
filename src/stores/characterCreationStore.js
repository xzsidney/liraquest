import { defineStore } from 'pinia';
import api from '../services/api';
export const useCharacterCreationStore = defineStore('characterCreation', {
    state: () => ({
        // Definições carregadas da API
        packages: [],
        clans: [],
        archetypes: [],
        predators: [],
        attributesList: [],
        skillsList: [],
        backgroundsList: [],
        meritsFlawsList: [],
        bloodPotencies: [],
        resonances: [],
        // Dados do Formulário do Jogador
        form: {
            name: '',
            avatarUrl: null,
            concept: '', // Archetype ID ou Nome
            clanId: null,
            predatorId: null,
            sire: '', // Agora armazenaremos o ID ou nome do Senhor aqui
            ambition: '',
            desire: '',
            chronicleTenets: '',
            history: '',
            pillar: '',
            backgroundId: 'none', // Valor default do radio button
            apparentAge: null,
            dateOfBirth: '',
            dateOfDeath: '',
        },
        // Sires dinâmicos baseados no clã
        availableSires: [],
        // Estado da UI
        isLoading: false,
        errorMessage: '',
        currentStep: 1
    }),
    getters: {
        professionPackages(state) {
            return state.packages.filter(p => p.packageType === 'PROFESSION');
        },
        backgroundPackages(state) {
            return state.packages.filter(p => p.packageType === 'BACKGROUND_BUNDLE');
        },
        selectedProfessionPackage(state) {
            if (!state.form.concept)
                return null;
            return state.packages.find(p => p.id === state.form.concept);
        },
        selectedBackgroundPackage(state) {
            if (!state.form.backgroundId || state.form.backgroundId === 'none')
                return null;
            return state.packages.find(p => p.id === state.form.backgroundId);
        },
        // Apenas clãs interessados na profissão dinâmica
        filteredClans(state) {
            const selected = this.selectedProfessionPackage;
            if (!selected)
                return state.clans;
            const allowedClanItems = selected.CreationPackageItems?.filter((item) => item.itemType === 'CLAN_ALLOWED') || [];
            if (allowedClanItems.length === 0)
                return state.clans; // No restriction
            const allowedIds = allowedClanItems.map((item) => item.referenceId);
            return state.clans.filter(c => allowedIds.includes(c.id));
        },
        // Apenas pacotes de predadores disponíveis para o Clã
        filteredPredatorPackages(state) {
            const predPackages = state.packages.filter(p => p.packageType === 'PREDATOR_CHOICE');
            if (!state.form.clanId)
                return predPackages; // Not filtered yet
            return predPackages.filter(pkg => {
                const restrictions = pkg.CreationPackageItems?.filter((item) => item.itemType === 'CLAN_RESTRICTION') || [];
                if (restrictions.length === 0)
                    return true; // No restriction
                const restrictedIds = restrictions.map((item) => item.referenceId);
                return restrictedIds.includes(state.form.clanId);
            });
        },
        selectedPredatorPackage(state) {
            if (!state.form.predatorId)
                return null;
            return state.packages.find(p => p.id === state.form.predatorId);
        },
        // Cálculo dinâmico de Atributos com base nos Pacotes
        calculatedAttributes(state) {
            const attrs = {};
            state.attributesList.forEach(a => {
                attrs[a.id] = 1; // Padrão
            });
            if (this.selectedProfessionPackage) {
                const attrItems = this.selectedProfessionPackage.CreationPackageItems?.filter((i) => i.itemType === 'ATTRIBUTE') || [];
                attrItems.forEach((item) => {
                    if (attrs[item.referenceId] !== undefined) {
                        attrs[item.referenceId] += item.amount;
                    }
                });
            }
            if (this.selectedPredatorPackage) {
                const attrItems = this.selectedPredatorPackage.CreationPackageItems?.filter((i) => i.itemType === 'ATTRIBUTE') || [];
                attrItems.forEach((item) => {
                    if (attrs[item.referenceId] !== undefined) {
                        attrs[item.referenceId] += item.amount;
                    }
                });
            }
            return attrs;
        },
        // Cálculo dinâmico de Perícias com base nos Pacotes
        calculatedSkills(state) {
            const skills = {};
            state.skillsList.forEach(s => {
                skills[s.id] = 0; // Padrão
            });
            if (this.selectedProfessionPackage) {
                const skillItems = this.selectedProfessionPackage.CreationPackageItems?.filter((i) => i.itemType === 'SKILL') || [];
                skillItems.forEach((item) => {
                    if (skills[item.referenceId] !== undefined) {
                        skills[item.referenceId] += item.amount;
                    }
                });
            }
            if (this.selectedPredatorPackage) {
                const skillItems = this.selectedPredatorPackage.CreationPackageItems?.filter((i) => i.itemType === 'SKILL') || [];
                skillItems.forEach((item) => {
                    if (skills[item.referenceId] !== undefined) {
                        skills[item.referenceId] += item.amount;
                    }
                });
            }
            return skills;
        },
        derivedStats(state) {
            let physical = 1;
            let social = 1;
            let mental = 1;
            // Conta o nível mais alto para determinar vitalidade e força de vontade (simplificação V5 para o App)
            const attrs = this.calculatedAttributes;
            state.attributesList.forEach(a => {
                const val = attrs[a.id] || 1;
                const cat = a.category?.toUpperCase() || '';
                if (cat === 'PHYSICAL' || cat === 'FÍSICO')
                    if (val > physical)
                        physical = val;
                if (cat === 'SOCIAL')
                    if (val > social)
                        social = val;
                if (cat === 'MENTAL')
                    if (val > mental)
                        mental = val;
            });
            return {
                health: physical + 3,
                willpower: social + mental,
                bloodPotency: 1, // Sangue-fraco seria 0, lidado no componente
                hunger: 1,
                humanity: 7 // Pode variar pela profissão
            };
        }
    },
    actions: {
        getPackageBonusesSummary(packageId) {
            if (!packageId)
                return null;
            const pkg = this.packages.find(p => p.id === packageId);
            if (!pkg || !pkg.CreationPackageItems)
                return null;
            const summary = {
                'Tipo de Predador': [],
                'Atributos': [],
                'Perícias': [],
                'Antecedentes': [],
                'Qualidades': [],
                'Defeitos': []
            };
            pkg.CreationPackageItems.forEach((item) => {
                let name = 'Desconhecido';
                let prefix = '+';
                let amount = item.amount;
                let typeGroup = '';
                if (item.itemType === 'ATTRIBUTE') {
                    const attr = this.attributesList.find(a => a.id === item.referenceId);
                    if (attr) {
                        name = attr.name;
                        typeGroup = 'Atributos';
                    }
                }
                else if (item.itemType === 'SKILL') {
                    const skill = this.skillsList.find(s => s.id === item.referenceId);
                    if (skill) {
                        name = skill.name;
                        typeGroup = 'Perícias';
                    }
                }
                else if (item.itemType === 'PREDATOR') {
                    const pred = this.predators.find(p => p.id === item.referenceId);
                    if (pred) {
                        name = pred.name;
                        typeGroup = 'Tipo de Predador';
                        amount = '';
                        prefix = '';
                    }
                }
                else if (item.itemType === 'BACKGROUND') {
                    typeGroup = 'Antecedentes';
                    const bg = this.backgroundsList.find(b => b.id === item.referenceId);
                    if (bg)
                        name = bg.name;
                }
                else if (item.itemType === 'MERIT') {
                    typeGroup = 'Qualidades';
                    const merit = this.meritsFlawsList.find(m => m.id === item.referenceId);
                    if (merit)
                        name = merit.name;
                }
                else if (item.itemType === 'FLAW') {
                    typeGroup = 'Defeitos';
                    const flaw = this.meritsFlawsList.find(m => m.id === item.referenceId);
                    if (flaw)
                        name = flaw.name;
                    prefix = '-';
                }
                if (typeGroup && name !== 'Desconhecido') {
                    summary[typeGroup].push(`${name} ${prefix}${amount}`.trim());
                }
            });
            // Filter out empty groups and format as array of strings for UI
            const result = [];
            Object.entries(summary).forEach(([group, items]) => {
                if (items.length > 0)
                    result.push({ group, items });
            });
            return result.length > 0 ? result : null;
        },
        resetForm() {
            this.form = {
                name: '',
                avatarUrl: null,
                concept: '',
                clanId: null,
                predatorId: null,
                sire: '',
                ambition: '',
                desire: '',
                chronicleTenets: '',
                history: '',
                pillar: '',
                backgroundId: 'none',
                apparentAge: null,
                dateOfBirth: '',
                dateOfDeath: '',
            };
            this.currentStep = 1;
            this.errorMessage = '';
        },
        async fetchLibraries() {
            this.isLoading = true;
            try {
                const [pkgRes, clanRes, predRes, archRes, resRes, bpRes, attrRes, skRes, bgRes, mfRes] = await Promise.all([
                    api.get('/api/creation-packages'),
                    api.get('/api/definition-clans'),
                    api.get('/api/definition-predators'),
                    api.get('/api/definition-archetypes'),
                    api.get('/api/definition-resonances'),
                    api.get('/api/definition-blood-potencies'),
                    api.get('/api/definition-attributes'),
                    api.get('/api/definition-skills'),
                    api.get('/api/definition-backgrounds'),
                    api.get('/api/definition-merit-flaws')
                ]);
                this.packages = pkgRes.data;
                this.clans = clanRes.data;
                this.predators = predRes.data;
                this.archetypes = archRes.data;
                this.resonances = resRes.data;
                this.bloodPotencies = bpRes.data;
                this.attributesList = attrRes.data;
                this.skillsList = skRes.data;
                this.backgroundsList = bgRes.data;
                this.meritsFlawsList = mfRes.data;
            }
            catch (err) {
                console.error('Erro ao carregar bibliotecas:', err);
                if (err.response && err.response.status === 401) {
                    this.errorMessage = 'Sessão expirada ou inválida. Por favor, retorne e faça login novamente.';
                }
                else {
                    this.errorMessage = 'Falha ao conectar com a Biblioteca Central.';
                }
            }
            finally {
                this.isLoading = false;
            }
        },
        async fetchAvailableSires(clanId) {
            if (!clanId)
                return;
            try {
                const res = await api.get(`/api/character-vampires/sires?clanId=${clanId}`);
                this.availableSires = res.data;
            }
            catch (err) {
                console.error('Erro ao buscar senhores do clã:', err);
                this.availableSires = [];
            }
        },
        async uploadAvatar(file) {
            const formData = new FormData();
            formData.append('avatar', file);
            try {
                const res = await api.post('/api/upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                this.form.avatarUrl = res.data.url;
            }
            catch (err) {
                console.error('Erro no upload de avatar', err);
                throw err;
            }
        },
        nextStep() {
            if (this.currentStep < 6)
                this.currentStep++;
        },
        prevStep() {
            if (this.currentStep > 1)
                this.currentStep--;
        },
        setStep(step) {
            if (step >= 1 && step <= 6)
                this.currentStep = step;
        },
        async saveCharacter(userId) {
            this.isLoading = true;
            this.errorMessage = '';
            try {
                const attributesPayload = Object.entries(this.calculatedAttributes).map(([id, val]) => ({
                    definitionAttributeId: id,
                    value: val
                }));
                const skillsPayload = Object.entries(this.calculatedSkills)
                    .map(([id, val]) => ({
                    definitionSkillId: id,
                    value: val
                }));
                const stats = this.derivedStats;
                let realPredatorId = null;
                if (this.selectedPredatorPackage) {
                    const predItem = this.selectedPredatorPackage.CreationPackageItems?.find((i) => i.itemType === 'PREDATOR');
                    if (predItem)
                        realPredatorId = predItem.referenceId;
                }
                const backgroundsPayload = [];
                const meritsFlawsPayload = [];
                if (this.selectedBackgroundPackage) {
                    const items = this.selectedBackgroundPackage.CreationPackageItems || [];
                    items.forEach((item) => {
                        if (item.itemType === 'BACKGROUND') {
                            backgroundsPayload.push({
                                definitionBackgroundId: item.referenceId,
                                value: item.amount
                            });
                        }
                        else if (item.itemType === 'MERIT' || item.itemType === 'FLAW') {
                            meritsFlawsPayload.push({
                                definitionMeritFlawId: item.referenceId,
                                value: item.amount
                            });
                        }
                    });
                }
                const payload = {
                    userId,
                    name: this.form.name,
                    avatarUrl: this.form.avatarUrl,
                    concept: this.selectedProfessionPackage?.name || null,
                    clanId: this.form.clanId,
                    predatorId: realPredatorId,
                    sire: this.form.sire || null,
                    generation: 12, // Padrão Neófito
                    ambition: this.form.ambition || null,
                    desire: this.form.desire || null,
                    chronicleTenets: '1. A Máscara é a lei absoluta. 2. Não mate inocentes sem necessidade. 3. O território do Príncipe é sagrado.',
                    history: this.form.history || null,
                    apparentAge: this.form.apparentAge || null,
                    dateOfBirth: this.form.dateOfBirth || null,
                    dateOfDeath: this.form.dateOfDeath || null,
                    touchstones: this.form.pillar ? [{ name: this.form.pillar, description: 'Primeiro pilar e âncora da humanidade.' }] : [],
                    hunger: stats.hunger,
                    humanity: stats.humanity,
                    attributes: attributesPayload,
                    skills: skillsPayload,
                    disciplines: [], // Recebe pontos base no backend baseados no clã
                    powers: [],
                    meritsFlaws: meritsFlawsPayload,
                    backgrounds: backgroundsPayload,
                    equipments: []
                };
                const response = await api.post('/api/character-vampires', payload);
                return response.data;
            }
            catch (err) {
                console.error('Erro ao criar personagem:', err);
                this.errorMessage = err.response?.data?.error || 'Erro ao salvar ficha no banco.';
                throw err;
            }
            finally {
                this.isLoading = false;
            }
        }
    }
});
