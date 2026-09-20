import "dotenv/config";
import mongoose from "mongoose";
import User from "./models/User.js";
import Incident from "./models/Incident.js";
import Team from "./models/Team.js";
import Report from "./models/Report.js";
import Alert from "./models/Alert.js";
import bcrypt from "bcryptjs";
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined");
}
const seedDatabase = async () => {
    try {
        console.log("🔌 Connecting to MongoDB...");
        await mongoose.connect(MONGODB_URI);
        console.log("✅ MongoDB connected");
        // -----------------------------------------
        // RESET DATABASE
        // -----------------------------------------
        console.log("🧹 Clearing existing database...");
        await Promise.all([
            User.deleteMany({}),
            Incident.deleteMany({}),
            Team.deleteMany({}),
            Report.deleteMany({}),
            Alert.deleteMany({}),
        ]);
        console.log("✅ Existing data cleared");
        // -----------------------------------------
        // USERS
        // -----------------------------------------
        const adminPassword = await bcrypt.hash("admin123", 10);
        const managerPassword = await bcrypt.hash("manager123", 10);
        const users = await User.insertMany([
            {
                name: "ResQAI Admin",
                email: "admin@resqai.com",
                password: adminPassword,
                role: "admin",
                phone: "9999999999",
                isActive: true,
            },
            {
                name: "Field Manager",
                email: "manager@resqai.com",
                password: managerPassword,
                role: "field_manager",
                phone: "9999999998",
                isActive: true,
            },
        ]);
        console.log(`👤 Created ${users.length} users`);
        // -----------------------------------------
        // TEAMS
        // -----------------------------------------
        const teams = await Team.insertMany([
            {
                teamId: "TEAM-001",
                name: "Fire & Rescue Alpha",
                type: "fire",
                status: "available",
                location: {
                    address: "Vadodara Fire Station",
                    latitude: 22.3072,
                    longitude: 73.1812,
                },
                members: [
                    "Rahul Sharma",
                    "Amit Patel",
                    "Vivek Shah",
                ],
                capabilities: [
                    "fire_suppression",
                    "building_rescue",
                    "ladder_rescue",
                ],
                contactNumber: "101",
            },
            {
                teamId: "TEAM-002",
                name: "Emergency Medical Alpha",
                type: "medical",
                status: "available",
                location: {
                    address: "SSG Hospital",
                    latitude: 22.315,
                    longitude: 73.175,
                },
                members: [
                    "Dr. Neha Patel",
                    "Rohan Mehta",
                    "Karan Shah",
                ],
                capabilities: [
                    "first_aid",
                    "trauma",
                    "critical_care",
                ],
                contactNumber: "108",
            },
            {
                teamId: "TEAM-003",
                name: "Search & Rescue Alpha",
                type: "rescue",
                status: "available",
                location: {
                    address: "Vadodara Rescue Base",
                    latitude: 22.3,
                    longitude: 73.19,
                },
                members: [
                    "Arjun Desai",
                    "Jay Patel",
                    "Harsh Mehta",
                ],
                capabilities: [
                    "search_and_rescue",
                    "building_rescue",
                    "trapped_person_extraction",
                ],
                contactNumber: "112",
            },
            {
                teamId: "TEAM-004",
                name: "Police Response Alpha",
                type: "police",
                status: "available",
                location: {
                    address: "Vadodara Police HQ",
                    latitude: 22.3075,
                    longitude: 73.1815,
                },
                members: [
                    "Officer Raj",
                    "Officer Amit",
                    "Officer Sameer",
                ],
                capabilities: [
                    "traffic_control",
                    "crowd_control",
                    "area_security",
                ],
                contactNumber: "100",
            },
            {
                teamId: "TEAM-005",
                name: "Disaster Response Alpha",
                type: "disaster_response",
                status: "available",
                location: {
                    address: "Emergency Response Center",
                    latitude: 22.29,
                    longitude: 73.17,
                },
                members: [
                    "Manoj Kumar",
                    "Suresh Patel",
                    "Vishal Shah",
                ],
                capabilities: [
                    "flood_response",
                    "disaster_management",
                    "evacuation",
                    "emergency_logistics",
                ],
                contactNumber: "1078",
            },
        ]);
        console.log(`🚑 Created ${teams.length} teams`);
        // -----------------------------------------
        // INCIDENTS
        // -----------------------------------------
        const fireIncident = await Incident.create({
            incidentId: "INC-0001",
            type: "fire",
            title: "Building Fire on Main Road",
            description: "Major fire reported inside a commercial building. Multiple people may be trapped.",
            severity: "critical",
            status: "reported",
            priority: 5,
            location: {
                address: "Main Road, Vadodara",
                latitude: 22.3072,
                longitude: 73.1812,
            },
            peopleAffected: 12,
            peopleTrapped: 5,
            medicalAssistance: true,
            source: "citizen",
        });
        const floodIncident = await Incident.create({
            incidentId: "INC-0002",
            type: "flood",
            title: "Flash Flood Near Residential Area",
            description: "Heavy rainfall has caused water levels to rise rapidly in a residential area.",
            severity: "high",
            status: "verified",
            priority: 4,
            location: {
                address: "Alkapuri, Vadodara",
                latitude: 22.31,
                longitude: 73.17,
            },
            peopleAffected: 35,
            peopleTrapped: 3,
            medicalAssistance: true,
            source: "field_team",
        });
        const accidentIncident = await Incident.create({
            incidentId: "INC-0003",
            type: "accident",
            title: "Major Road Accident",
            description: "Multiple vehicles involved in a road accident. Traffic is blocked and medical assistance is required.",
            severity: "high",
            status: "assigned",
            priority: 4,
            location: {
                address: "Ring Road, Vadodara",
                latitude: 22.3,
                longitude: 73.19,
            },
            peopleAffected: 8,
            peopleTrapped: 1,
            medicalAssistance: true,
            source: "citizen",
        });
        const medicalIncident = await Incident.create({
            incidentId: "INC-0004",
            type: "medical",
            title: "Multiple Casualties Reported",
            description: "Several people require urgent medical assistance following an incident.",
            severity: "medium",
            status: "reported",
            priority: 3,
            location: {
                address: "Station Road, Vadodara",
                latitude: 22.315,
                longitude: 73.175,
            },
            peopleAffected: 6,
            peopleTrapped: 0,
            medicalAssistance: true,
            source: "citizen",
        });
        console.log("🚨 Created 4 incidents");
        // -----------------------------------------
        // ASSIGN TEAMS TO FIRE INCIDENT
        // -----------------------------------------
        if (teams.length < 3) {
            throw new Error("Failed to create the required teams for fire incident");
        }
        const fireTeam = teams[0];
        const medicalTeam = teams[1];
        const rescueTeam = teams[2];
        if (!fireTeam || !medicalTeam || !rescueTeam) {
            throw new Error("Required seed teams were not created");
        }
        fireIncident.assignedTeams = [
            fireTeam._id,
            medicalTeam._id,
            rescueTeam._id,
        ];
        fireIncident.status = "en_route";
        await fireIncident.save();
        await Team.updateOne({ _id: fireTeam._id }, {
            status: "en_route",
            currentIncident: fireIncident._id,
        });
        await Team.updateOne({ _id: medicalTeam._id }, {
            status: "en_route",
            currentIncident: fireIncident._id,
        });
        await Team.updateOne({ _id: rescueTeam._id }, {
            status: "en_route",
            currentIncident: fireIncident._id,
        });
        console.log("🚒 Fire incident teams assigned");
        // -----------------------------------------
        // REPORTS
        // -----------------------------------------
        const reports = await Report.insertMany([
            {
                reportId: "REP-0001",
                description: "Large fire visible from Main Road. Smoke coming from the upper floors.",
                type: "fire",
                location: {
                    address: "Main Road, Vadodara",
                    latitude: 22.3072,
                    longitude: 73.1812,
                },
                peopleAffected: 12,
                peopleTrapped: 5,
                medicalAssistance: true,
                reporterName: "Citizen Reporter",
                reporterPhone: "9876543210",
                source: "citizen",
                status: "linked",
                incidentId: fireIncident._id,
            },
            {
                reportId: "REP-0002",
                description: "Water level rising rapidly near residential buildings.",
                type: "flood",
                location: {
                    address: "Alkapuri, Vadodara",
                    latitude: 22.31,
                    longitude: 73.17,
                },
                peopleAffected: 35,
                peopleTrapped: 3,
                medicalAssistance: true,
                source: "field_team",
                status: "linked",
                incidentId: floodIncident._id,
            },
        ]);
        console.log(`📄 Created ${reports.length} reports`);
        // -----------------------------------------
        // ALERTS
        // -----------------------------------------
        const alerts = await Alert.insertMany([
            {
                alertId: "ALT-0001",
                type: "critical_incident",
                severity: "critical",
                title: "Critical Fire Emergency",
                message: "Immediate response required for Building Fire on Main Road.",
                incidentId: fireIncident._id,
                status: "active",
            },
            {
                alertId: "ALT-0002",
                type: "response_delay",
                severity: "warning",
                title: "Response Delay Detected",
                message: "Response to the flood incident has exceeded the expected response time.",
                incidentId: floodIncident._id,
                status: "active",
                metadata: {
                    delayMinutes: 7,
                },
            },
            {
                alertId: "ALT-0003",
                type: "escalation",
                severity: "critical",
                title: "Emergency Response Escalated",
                message: "The building fire incident requires immediate escalation.",
                incidentId: fireIncident._id,
                status: "active",
                metadata: {
                    delayMinutes: 12,
                    currentSeverity: "critical",
                },
            },
        ]);
        console.log(`🔔 Created ${alerts.length} alerts`);
        // -----------------------------------------
        // SUMMARY
        // -----------------------------------------
        console.log("\n====================================");
        console.log("🎉 RESQAI DATABASE SEEDED");
        console.log("====================================");
        console.log("\n🔐 LOGIN CREDENTIALS");
        console.log("------------------------------------");
        console.log("Admin:");
        console.log("Email: admin@resqai.com");
        console.log("Password: admin123");
        console.log("\nField Manager:");
        console.log("Email: manager@resqai.com");
        console.log("Password: manager123");
        console.log("\n📊 SEED DATA");
        console.log("------------------------------------");
        console.log(`Users:     ${users.length}`);
        console.log(`Teams:     ${teams.length}`);
        console.log(`Incidents: 4`);
        console.log(`Reports:   ${reports.length}`);
        console.log(`Alerts:    ${alerts.length}`);
        console.log("\n🚨 Main Incident:");
        console.log("INC-0001 - Building Fire on Main Road");
        console.log("\n====================================\n");
    }
    catch (error) {
        console.error("❌ SEED ERROR:", error);
        process.exitCode = 1;
    }
    finally {
        await mongoose.disconnect();
        console.log("🔌 MongoDB disconnected");
    }
};
seedDatabase();
//# sourceMappingURL=seed.js.map