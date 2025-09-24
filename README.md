# ResQLink LGU Dashboard

A comprehensive emergency response management system for Local Government Units (LGUs) in the Philippines, designed to streamline incident reporting, responder coordination, and disaster management operations.

## 🚨 Overview

ResQLink LGU Dashboard is a real-time command center application that enables local government units to:

- **Monitor Active Incidents**: Track floods, fires, earthquakes, medical emergencies, and other critical events
- **Manage Emergency Responders**: Coordinate team deployments, track availability, and optimize response times
- **Visualize Operations**: Interactive map view with incident locations, responder positions, and facility statsus
- **Automated Decision Support**: AI-powered risk assessment and resource allocation recommendations
- **Mobile-First Design**: Optimized for mobile devices used by field personnel and command center operators

## 🎯 Key Features

### 📊 Command Center Dashboard

- **Real-time KPIs**: Active reports, pending incidents, daily resolutions, and responder availability
- **Intake Queue**: Prioritized incident list with severity-based filtering
- **Quick Actions**: One-tap incident creation, broadcast alerts, and map navigation
- **Offline Support**: Continues operation during connectivity issues

### 🗺️ Interactive Map View

- **Incident Visualization**: Color-coded markers showing incident type and severity
- **Responder Tracking**: Real-time team locations and availability status
- **Facility Management**: Hospital, police, fire station, and evacuation center status
- **Geographic Context**: Built on Leaflet maps with Philippine-specific coordinates

### 👥 Responder Management

- **Team Coordination**: Track multiple response teams with specializations
- **Auto-Assignment**: Intelligent responder matching based on proximity and availability
- **Status Updates**: Real-time team status (Available, En Route, On Scene, Off Duty)
- **ETA Calculations**: Distance-based response time estimates

### 🚨 Incident Management

- **Multi-Source Reporting**: Hotline, mobile app, CCTV, and citizen reports
- **AI Risk Assessment**: Automated hazard scoring and escalation recommendations
- **Impact Analysis**: Geographic radius calculations and affected area mapping
- **Media Integration**: Photo and video evidence support

### 🔔 Alert System

- **Real-time Notifications**: Push alerts for new incidents and status changes
- **Priority Broadcasting**: System-wide emergency announcements
- **Unread Counters**: Visual indicators for pending alerts and reports
- **Notification History**: Complete audit trail of all alerts

## 🛠️ Technology Stack

### Frontend Framework

- **React 18**: Modern functional components with hooks
- **Vite**: Fast development build tool and bundler
- **JavaScript/JSX**: Component-based architecture

### UI/UX Libraries

- **Tailwind CSS**: Utility-first styling framework
- **Headless UI**: Accessible, unstyled UI components
- **Heroicons**: Beautiful SVG icons for React
- **Lucide React**: Additional icon set for enhanced UI

### Mapping & Geolocation

- **Leaflet**: Open-source interactive maps
- **React Leaflet**: React components for Leaflet maps
- **Geographic Calculations**: Distance computation and coordinate handling

### State Management

- **React Context**: Global state for notifications and app data
- **Local State**: Component-level state management with hooks

### Development Tools

- **PostCSS**: CSS processing and optimization
- **Autoprefixer**: Automatic vendor prefixing
- **ESLint**: Code quality and consistency (configured)

## 📱 Responsive Design

The application is specifically designed for mobile-first usage:

- **Mobile Command Centers**: Tablet and smartphone operation
- **Field Personnel**: Responder teams using mobile devices
- **Emergency Coordinators**: Desktop and laptop compatibility
- **Offline Capability**: Core functions work without internet

## 🏗️ Project Structure

```
resqlink-lgu-dashboard/
├── public/                     # Static assets
├── src/
│   ├── components/            # React components
│   │   ├── AlertFeed.jsx     # Notification feed
│   │   ├── BottomNav.jsx     # Mobile navigation
│   │   ├── Dashboard.jsx     # Main dashboard view
│   │   ├── IncidentCard.jsx  # Incident display cards
│   │   ├── KPI.jsx           # Key performance indicators
│   │   ├── Management.jsx    # Responder management
│   │   ├── MapView.jsx       # Interactive map component
│   │   ├── MapView.css       # Map-specific styles
│   │   ├── More.jsx          # Settings and additional features
│   │   ├── OfflineBanner.jsx # Connectivity status
│   │   ├── PopupIncident.jsx # Incident detail modal
│   │   ├── QuickActions.jsx  # Floating action button
│   │   ├── Responders.jsx    # Team management
│   │   └── ResponseHistory.jsx # Historical data
│   ├── context/
│   │   └── NotificationContext.jsx # Global notification state
│   ├── styles/
│   │   └── globals.css       # Global styles and Tailwind imports
│   ├── App.jsx               # Root component
│   └── main.jsx              # Application entry point
├── index.html                # HTML template
├── package.json              # Dependencies and scripts
├── tailwind.config.js        # Tailwind CSS configuration
├── postcss.config.js         # PostCSS configuration
├── vite.config.js            # Vite build configuration
└── README.md                 # This file
```

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js** (version 16 or higher)
- **npm** (comes with Node.js) or **yarn**
- **Git** (for version control)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Iron-Mark/resqlink-lgu-dashboard.git
   cd resqlink-lgu-dashboard
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open application**
   - Navigate to `http://localhost:5173` in your browser
   - The development server supports hot reload for instant updates

### Build for Production

```bash
# Create optimized production build
npm run build

# Preview production build locally
npm run preview
```

## 🔧 Configuration

### Tailwind CSS Customization

The `tailwind.config.js` file includes custom color schemes for emergency management:

```javascript
// Custom colors for emergency management
colors: {
  'status-high': '#EF4444',      // High severity incidents
  'status-medium': '#F59E0B',    // Medium severity incidents
  'status-low': '#3B82F6',       // Low severity incidents
  'status-resolved': '#10B981'   // Resolved incidents
}
```

### Map Configuration

Default coordinates are set for Marikina City, Philippines. Update `INCIDENT_COORDINATES` in `Dashboard.jsx` for your specific LGU area:

```javascript
const INCIDENT_COORDINATES = {
  "Brgy. YourBarangay": { lat: 14.676, lng: 121.0437 },
  // Add your barangay coordinates
};
```

## 📊 Data Models

### Incident Structure

```javascript
{
  id: "INC-001",
  type: "Flood | Fire | Earthquake | Medical Emergency | etc.",
  severity: "Low | Medium | High",
  status: "Awaiting Dispatch | Team Mobilized | On Scene | Resolved",
  location: "Barangay Name",
  coordinates: { lat: number, lng: number },
  time: "Relative time string",
  citizenReports: number,
  aiHazardScore: 0.0-1.0,
  aiSummary: "AI-generated assessment",
  riskBand: "Blue | Amber | Red",
  impactRadiusKm: number,
  reportSources: ["Hotline", "Mobile App", "CCTV", "etc."],
  recommendedAction: "Action guidance",
  assignedResponder: ResponderObject,
  mediaUrl: "Evidence photo/video URL"
}
```

### Responder Structure

```javascript
{
  id: "R-001",
  name: "Team Alpha",
  status: "Available | En Route | On Scene | Off Duty",
  members: number,
  location: "Current location description",
  lastActive: "Time string",
  specialization: ["Flood", "Fire", "Medical", "etc."],
  coordinates: { lat: number, lng: number },
  currentAssignment: "incident_id | null",
  etaMinutes: number
}
```

### Facility Structure

```javascript
{
  id: "FAC-001",
  type: "Hospital | Police Station | Fire Station | Evacuation Center",
  name: "Facility Name",
  address: "Full address",
  hotline: "Contact number",
  status: "Open | Closed | At Capacity",
  notes: "Additional information",
  coordinates: { lat: number, lng: number },
  lastUpdated: "ISO timestamp"
}
```

## 🌐 API Integration

The application currently uses mock data for demonstration. To integrate with real data sources:

### Incident Reporting APIs

- **LGU Hotline System**: Connect to call center databases
- **Mobile Apps**: Integrate citizen reporting applications
- **IoT Sensors**: River gauges, seismic monitors, weather stations
- **CCTV Networks**: Automated incident detection systems

### Communication Systems

- **Radio Networks**: Responder communication integration
- **SMS Gateways**: Bulk messaging for alerts
- **Social Media**: Official announcements and updates
- **Emergency Broadcasting**: EAS system integration

### Geographic Data

- **Philippine Mapping**: NAMRIA or Google Maps integration
- **Weather Services**: PAGASA weather data feeds
- **Traffic Systems**: MMDA or local traffic monitoring
- **Utility Networks**: Power, water, telecommunications status

## 🔒 Security Considerations

### Data Protection

- **Personal Information**: Secure handling of citizen and responder data
- **Location Privacy**: Encrypted coordinate transmission
- **Communication Security**: Secure channels for sensitive operations
- **Access Control**: Role-based permissions for different user types

### Operational Security

- **Offline Capability**: Core functions work during network outages
- **Data Backup**: Regular backups of incident and response data
- **System Redundancy**: Multiple data sources and failover systems
- **Audit Trails**: Complete logging of all system activities

## 🤝 Contributing

We welcome contributions to improve ResQLink LGU Dashboard:

### Development Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards

- **React Best Practices**: Functional components, custom hooks
- **Tailwind CSS**: Utility-first styling approach
- **Mobile-First**: Responsive design principles
- **Accessibility**: WCAG compliance for emergency systems
- **Performance**: Optimized for mobile and low-bandwidth scenarios

### Testing

- **Component Testing**: React Testing Library
- **Integration Testing**: End-to-end scenarios
- **Mobile Testing**: Various device and screen sizes
- **Offline Testing**: Network connectivity scenarios

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Emergency Contacts

For system emergencies or critical issues:

- **Technical Support**: [Insert contact information]
- **System Administrator**: [Insert contact information]
- **Emergency Coordinator**: [Insert LGU emergency contact]

## 🙏 Acknowledgments

- **Local Government Units** for operational requirements and feedback
- **Philippine Disaster Risk Reduction and Management** for guidance
- **Open Source Community** for the excellent libraries and tools
- **Emergency Responders** for their dedication and service

## 📈 Roadmap

### Planned Features

- [ ] **Multi-LGU Support**: Region-wide coordination
- [ ] **Advanced Analytics**: Predictive incident modeling
- [ ] **Resource Management**: Equipment and supply tracking
- [ ] **Training Modules**: Responder skill development
- [ ] **Public Portal**: Citizen-facing information interface
- [ ] **Mobile Apps**: Native iOS and Android applications
- [ ] **API Framework**: Third-party integration support
- [ ] **Multi-language**: Filipino and regional language support

### Performance Goals

- [ ] **Sub-second Response**: Real-time data updates
- [ ] **99.9% Uptime**: High-availability infrastructure
- [ ] **Mobile Optimization**: Fast load times on 3G/4G
- [ ] **Scalability**: Support for multiple concurrent LGUs

---

**Built with ❤️ for Philippine Local Government Units and Emergency Responders**

For questions, issues, or suggestions, please [open an issue](https://github.com/Iron-Mark/resqlink-lgu-dashboard/issues) or contact the development team.
