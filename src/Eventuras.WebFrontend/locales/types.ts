export type LocalesCommonType = {
  // Header
  header: {
    auth: {
      login: string;
      logout: string;
    };
    userMenu: {
      title: string;
      profile: string;
      myCourses: string;
      admin: string;
    };
  };

  // Common section titles
  events: string;
  onlinecourses: string;
};
