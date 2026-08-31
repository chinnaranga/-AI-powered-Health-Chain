const fs = require('fs');
const path = require('path');

const subpagesDir = path.join(__dirname, 'src', 'pages', 'subpages');

const subpages = [
    'RecordsPage',
    'PatientRecordViewer',
    'AccessControlPage',
    'LogsPage',
    'SettingsPage',
    'AIMedicalSummaryPage',
    'SmartTimelinePage',
    'HealthAnalyticsPage',
    'MultiHospitalSimPage',
    'ABHAFlowPage',
    'NotificationsCenterPage',
    'ProfileIdentityPage',
    'EmergencyProfilePage',
    'ReferralHandoffPage',
    'PrescriptionManagementPage',
    'LabImagingResultsPage',
    'SecureMessagingPage',
    'AppointmentSchedulingPage',
    'MedicationAdherencePage',
    'InsuranceCoveragePage',
    'SupportHelpCenterPage',
    'ProviderDirectoryPage',
    'DocumentVaultPage',
    'CarePlanFollowUpPage',
    'VitalSignsTrendsPage',
    'DischargeSummaryPage',
    'FamilyCaregiverAccessPage',
    'VaccinationImmunizationPage',
    'WearablesMonitoringPage',
    'HealthGoalsLifestylePage',
    'OnboardingLinkingPage',
    'ReportsEvidenceCenterPage',
    'SecureSharingCenterPage',
    'SupportFeedbackCenterPage',
    'SystemPreferencesSecurityPage',
    'DemoModePage',
    'ReportsExportPage',
    'SecuritySettingsPage',
    'ComplianceDashboardPage',
    'DoctorRecordsPage',
    'ClinicalRecordViewer',
    'DoctorAccessControlPage',
    'DoctorLogsPage',
    'DoctorAnalyticsPage',
    'DoctorSettingsPage',
    'NotificationsPage',
    'HelpPage',
    'DoctorPatientAccessPage'
];

if (!fs.existsSync(subpagesDir)) {
    fs.mkdirSync(subpagesDir, { recursive: true });
}

subpages.forEach(name => {
    const filePath = path.join(subpagesDir, `${name}.jsx`);
    const content = `import React from 'react';

export default function ${name}() {
    return (
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm max-w-2xl mx-auto mt-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">${name.replace(/([A-Z])/g, ' $1').trim()}</h2>
            <p className="text-slate-500 text-sm">This module is currently initialized and ready for feature implementation.</p>
        </div>
    );
}
`;
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Generated: ${filePath}`);
});

console.log('All 48 subpage placeholder files generated successfully!');
