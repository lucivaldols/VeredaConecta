type Language = 'pt-BR' | 'en-US';

const translations = {
  'pt-BR': {
    nav: {
      dashboard: 'Dashboard',
      profile: 'Meu Perfil',
      chat: 'Bate-papo',
      members: 'Associados',
      projects: 'Projetos',
      creative: 'Criativo',
      financials: 'Financeiro',
      settings: 'Configurações',
    },
    dashboard: {
      memberWelcomeMessage: 'Explore as seções da nossa comunidade usando o menu de navegação. Você pode visualizar seu perfil, participar do nosso bate-papo global e acompanhar os projetos em andamento.',
    }
  },
  'en-US': {
    nav: {
      dashboard: 'Dashboard',
      profile: 'My Profile',
      chat: 'Chat',
      members: 'Members',
      projects: 'Projects',
      creative: 'Creative',
      financials: 'Financials',
      settings: 'Settings',
    },
     dashboard: {
      memberWelcomeMessage: 'Explore our community sections using the navigation menu. You can view your profile, join our global chat, and follow ongoing projects.',
    }
  },
};

export const getTranslator = (lang: Language, customTexts: { welcomeMessage: string }) => {
  const selectedTranslations = translations[lang];
  return (key: string): string => {
    const keys = key.split('.');
    let result: any = selectedTranslations;
    
    // Handle special case for custom text
    if (key === 'dashboard.memberWelcomeMessage' && customTexts.welcomeMessage) {
        return customTexts.welcomeMessage;
    }

    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        return key; // Return the key itself if not found
      }
    }
    return result;
  };
};
