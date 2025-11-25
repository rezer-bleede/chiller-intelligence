import { Route, Routes } from 'react-router-dom';
import DashboardPage from '../pages/dashboard/DashboardPage';
import BuildingsListPage from '../pages/buildings/BuildingsListPage';
import BuildingFormPage from '../pages/buildings/BuildingFormPage';
import ChillerUnitsListPage from '../pages/chillers/ChillerUnitsListPage';
import ChillerUnitFormPage from '../pages/chillers/ChillerUnitFormPage';
import DataSourcesListPage from '../pages/dataSources/DataSourcesListPage';
import DataSourceFormPage from '../pages/dataSources/DataSourceFormPage';
import AlertRulesListPage from '../pages/alertRules/AlertRulesListPage';
import AlertRuleFormPage from '../pages/alertRules/AlertRuleFormPage';
import OrganizationSettingsPage from '../pages/organizations/OrganizationSettingsPage';

const AppRoutes = () => (
  <Routes>
    <Route path="dashboard" element={<DashboardPage />} />
    <Route path="buildings" element={<BuildingsListPage />} />
    <Route path="buildings/new" element={<BuildingFormPage />} />
    <Route path="buildings/:id/edit" element={<BuildingFormPage />} />
    <Route path="chiller-units" element={<ChillerUnitsListPage />} />
    <Route path="chiller-units/new" element={<ChillerUnitFormPage />} />
    <Route path="chiller-units/:id/edit" element={<ChillerUnitFormPage />} />
    <Route path="data-sources" element={<DataSourcesListPage />} />
    <Route path="data-sources/new" element={<DataSourceFormPage />} />
    <Route path="data-sources/:id/edit" element={<DataSourceFormPage />} />
    <Route path="alert-rules" element={<AlertRulesListPage />} />
    <Route path="alert-rules/new" element={<AlertRuleFormPage />} />
    <Route path="alert-rules/:id/edit" element={<AlertRuleFormPage />} />
    <Route path="settings/organization" element={<OrganizationSettingsPage />} />
  </Routes>
);

export default AppRoutes;
