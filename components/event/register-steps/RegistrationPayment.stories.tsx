
import RegistrationPayment, { RegistrationSubmitValues } from './RegistrationPayment';

export default {
  title: 'Components/EventRegistration/RegistrationPayment',
  tags: ['autodocs'],
  component: RegistrationPayment,
};

export const Default = () => (
  <RegistrationPayment onSubmit = {(values:RegistrationSubmitValues)=>{console.log(values)}} />
)


