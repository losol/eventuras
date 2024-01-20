/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseHttpRequest } from './core/BaseHttpRequest';
import type { OpenAPIConfig } from './core/OpenAPI';
import { FetchHttpRequest } from './core/FetchHttpRequest';
import { CertificatesService } from './services/CertificatesService';
import { EventCertificatesService } from './services/EventCertificatesService';
import { EventCollectionService } from './services/EventCollectionService';
import { EventCollectionMappingService } from './services/EventCollectionMappingService';
import { EventProductsService } from './services/EventProductsService';
import { EventProductVariantsService } from './services/EventProductVariantsService';
import { EventsService } from './services/EventsService';
import { EventStatisticsService } from './services/EventStatisticsService';
import { NotificationRecipientsService } from './services/NotificationRecipientsService';
import { NotificationsService } from './services/NotificationsService';
import { NotificationsQueueingService } from './services/NotificationsQueueingService';
import { OnlineCourseService } from './services/OnlineCourseService';
import { OrdersService } from './services/OrdersService';
import { OrganizationMemberRolesService } from './services/OrganizationMemberRolesService';
import { OrganizationMembersService } from './services/OrganizationMembersService';
import { OrganizationsService } from './services/OrganizationsService';
import { OrganizationSettingsService } from './services/OrganizationSettingsService';
import { ProductsService } from './services/ProductsService';
import { RegistrationCertificateService } from './services/RegistrationCertificateService';
import { RegistrationOrdersService } from './services/RegistrationOrdersService';
import { RegistrationsService } from './services/RegistrationsService';
import { UserProfileService } from './services/UserProfileService';
import { UsersService } from './services/UsersService';
type HttpRequestConstructor = new (config: OpenAPIConfig) => BaseHttpRequest;
export class Eventuras {
    public readonly certificates: CertificatesService;
    public readonly eventCertificates: EventCertificatesService;
    public readonly eventCollection: EventCollectionService;
    public readonly eventCollectionMapping: EventCollectionMappingService;
    public readonly eventProducts: EventProductsService;
    public readonly eventProductVariants: EventProductVariantsService;
    public readonly events: EventsService;
    public readonly eventStatistics: EventStatisticsService;
    public readonly notificationRecipients: NotificationRecipientsService;
    public readonly notifications: NotificationsService;
    public readonly notificationsQueueing: NotificationsQueueingService;
    public readonly onlineCourse: OnlineCourseService;
    public readonly orders: OrdersService;
    public readonly organizationMemberRoles: OrganizationMemberRolesService;
    public readonly organizationMembers: OrganizationMembersService;
    public readonly organizations: OrganizationsService;
    public readonly organizationSettings: OrganizationSettingsService;
    public readonly products: ProductsService;
    public readonly registrationCertificate: RegistrationCertificateService;
    public readonly registrationOrders: RegistrationOrdersService;
    public readonly registrations: RegistrationsService;
    public readonly userProfile: UserProfileService;
    public readonly users: UsersService;
    public readonly request: BaseHttpRequest;
    constructor(config?: Partial<OpenAPIConfig>, HttpRequest: HttpRequestConstructor = FetchHttpRequest) {
        this.request = new HttpRequest({
            BASE: config?.BASE ?? 'http://localhost:8080',
            VERSION: config?.VERSION ?? '3',
            WITH_CREDENTIALS: config?.WITH_CREDENTIALS ?? false,
            CREDENTIALS: config?.CREDENTIALS ?? 'include',
            TOKEN: config?.TOKEN,
            USERNAME: config?.USERNAME,
            PASSWORD: config?.PASSWORD,
            HEADERS: config?.HEADERS,
            ENCODE_PATH: config?.ENCODE_PATH,
        });
        this.certificates = new CertificatesService(this.request);
        this.eventCertificates = new EventCertificatesService(this.request);
        this.eventCollection = new EventCollectionService(this.request);
        this.eventCollectionMapping = new EventCollectionMappingService(this.request);
        this.eventProducts = new EventProductsService(this.request);
        this.eventProductVariants = new EventProductVariantsService(this.request);
        this.events = new EventsService(this.request);
        this.eventStatistics = new EventStatisticsService(this.request);
        this.notificationRecipients = new NotificationRecipientsService(this.request);
        this.notifications = new NotificationsService(this.request);
        this.notificationsQueueing = new NotificationsQueueingService(this.request);
        this.onlineCourse = new OnlineCourseService(this.request);
        this.orders = new OrdersService(this.request);
        this.organizationMemberRoles = new OrganizationMemberRolesService(this.request);
        this.organizationMembers = new OrganizationMembersService(this.request);
        this.organizations = new OrganizationsService(this.request);
        this.organizationSettings = new OrganizationSettingsService(this.request);
        this.products = new ProductsService(this.request);
        this.registrationCertificate = new RegistrationCertificateService(this.request);
        this.registrationOrders = new RegistrationOrdersService(this.request);
        this.registrations = new RegistrationsService(this.request);
        this.userProfile = new UserProfileService(this.request);
        this.users = new UsersService(this.request);
    }
}

