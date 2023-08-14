type Title = {
  title: string;
};
type Description = {
  description: string;
};

type SubHeading = {
  subHeading: string;
};

type TitleDescription = Title & Description;

export type LocalesCommonType = {
  // Header
  header: {
    auth: {
      login: string;
      logout: string;
    };
  };
  // Common section titles
  events: string;
  onlinecourses: string;
};

export type LocalesEventRegistration = {
  customize: TitleDescription;
  payment: TitleDescription & SubHeading;
  complete: TitleDescription;
};
