import { apiInitializer } from 'discourse/lib/api';
import SubcategoryBar from '../components/subcategory-bar';

export default apiInitializer('1.14.0', (api) => {
    api.renderInOutlet(settings.plugin_outlet.trim(), SubcategoryBar);
});