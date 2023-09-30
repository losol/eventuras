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

type ErrorFeedback = TitleDescription;

type FormField = {
  label: string;
  feedbackIncorrect?: string;
  feedbackNoInput: string;
};

export type LocalesCommonType = {
  // Header
  header: {
    auth: {
      login: string;
      logout: string;
    };
  };
  buttons: {
    submit: string;
    continue: string;
    send: string;
    cancel: string;
  };
  // Common section titles
  event: string;
  events: string;
  onlinecourses: string;
  errors: {
    fatalError: ErrorFeedback;
  };
};

export type LocalesEventRegistration = {
  customize: TitleDescription;
  payment: TitleDescription & SubHeading;
  complete: TitleDescription;

  form: {
    customertype: {
      legend: string;
      private: string;
      business: string;
    };
    user: {
      legend: string;
      name: string;
      email: string;
      phoneNumber: string;
    };
    address: {
      legend: string;
      street: string;
      zip: string;
      city: string;
      country: string;
    };
    businessinfo: {
      legend: string;
      vatNumber: string;
      invoiceReference: string;
    };
  };

  buttons: {
    register: string;
  };
  feedback: {
    allreadyRegistered: string;
  };
};

export type LocalesAdmin = {
  createEvent: {
    content: TitleDescription;
    alreadyExists: ErrorFeedback;
  };
  editEvent: {
    content: TitleDescription;
  };
  eventColumns: {
    title: string;
    location: string;
    when: string;
    actions: string;
  };
  eventEmailer: {
    title: string;
    form: {
      status: FormField;
      type: FormField;
      subject: FormField;
      body: FormField;
      successFeedback: string;
    };
  };
} & Title;
