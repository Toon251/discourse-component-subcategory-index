import { apiInitializer } from 'discourse/lib/api';
import SubscriptionBar from '../components/subscription-bar';

export default apiInitializer('1.14.0', (api) => {
    api.renderInOutlet(settings.plugin_outlet.trim(), SubscriptionBar);
});