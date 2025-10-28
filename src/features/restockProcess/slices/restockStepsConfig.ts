import type { StepDefinition } from '../../deployProcess/components/Stepper/steps';
import SelectManufacturerStep from '../components/SelectManufacturerStep';

export const restockStepsConfig: StepDefinition[] = [
  {
    key: 'select-manufacturer',
    title: 'Select Manufacturer',
    component: SelectManufacturerStep,
  },
  {
    key: 'open-bid',
    title: 'Open Bid Request',
    component: () => null, // To be implemented
  },
  {
    key: 'view-bids',
    title: 'View Bids',
    component: () => null, // To be implemented
  },
  {
    key: 'order-payment',
    title: 'Order & Payment',
    component: () => null, // To be implemented
  },
  {
    key: 'tracking',
    title: 'Track Delivery',
    component: () => null, // To be implemented
  },
  {
    key: 'delivery',
    title: 'Complete Delivery',
    component: () => null, // To be implemented
  },
];
