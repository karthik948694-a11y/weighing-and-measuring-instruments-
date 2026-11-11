const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Application = require('../models/Application');
const Complaint = require('../models/Complaint');

// In-Memory Fallback store used when MongoDB Atlas is offline or not yet configured in .env
const memStore = {
  users: [],
  applications: [],
  complaints: [],
};

// Seed initial in-memory records
(async () => {
  const salt = await bcrypt.genSalt(10);
  const officerHash = await bcrypt.hash('Officer@123', salt);
  const ownerHash = await bcrypt.hash('Owner@123', salt);

  memStore.users.push({
    _id: 'usr_officer_01',
    name: 'Legal Metrology Officer',
    email: 'officer@lmvs.gov',
    officerId: '113iom20',
    phone: '011-2338-0000',
    shopName: 'Legal Metrology Enforcement Division',
    shopAddress: 'District Administrative Complex, Room 104',
    password: officerHash,
    role: 'Officer',
    createdAt: new Date(),
    async comparePassword(p) { return bcrypt.compare(p, this.password); },
    toJSON() {
      const { password, ...safe } = this;
      return { ...safe, id: this._id };
    },
  });

  memStore.users.push({
    _id: 'usr_owner_01',
    name: 'Rajesh Sharma',
    email: 'owner@lmvs.shop',
    phone: '9876543210',
    aadhaarNo: '5432 1098 7654',
    shopName: 'Sharma General Provisions & Grain Mart',
    shopAddress: 'Shop #14, Main Mandi Complex, Sector 2',
    password: ownerHash,
    role: 'Owner',
    createdAt: new Date(),
    async comparePassword(p) { return bcrypt.compare(p, this.password); },
    toJSON() {
      const { password, ...safe } = this;
      return { ...safe, id: this._id };
    },
  });
})();

function isAtlasConnected() {
  return mongoose.connection && mongoose.connection.readyState === 1;
}

// ----------------- USERS -----------------
const users = {
  async findOne(filter) {
    if (isAtlasConnected()) {
      return User.findOne(filter);
    }

    // In-memory matcher
    return memStore.users.find((u) => {
      if (filter.email && u.email && u.email.toLowerCase() === filter.email.toLowerCase()) return true;
      if (filter.officerId && u.officerId && u.officerId.toLowerCase() === filter.officerId.toLowerCase()) return true;
      if (filter.phone && u.phone && u.phone.includes(filter.phone)) return true;
      if (filter.aadhaarNo && u.aadhaarNo && u.aadhaarNo.includes(filter.aadhaarNo)) return true;

      if (filter.$or) {
        return filter.$or.some((sub) => {
          if (sub.email && u.email && u.email.toLowerCase() === sub.email.toLowerCase()) return true;
          if (sub.officerId && u.officerId && u.officerId.toLowerCase() === sub.officerId.toLowerCase()) return true;
          if (sub.phone && u.phone && (u.phone === sub.phone || (sub.phone.$regex && u.phone.includes(sub.phone.$regex)))) return true;
          if (sub.aadhaarNo && u.aadhaarNo && (u.aadhaarNo === sub.aadhaarNo || (sub.aadhaarNo.$regex && u.aadhaarNo.includes(sub.aadhaarNo.$regex)))) return true;
          return false;
        });
      }
      return false;
    }) || null;
  },

  async findById(id) {
    if (isAtlasConnected()) {
      return User.findById(id);
    }
    return memStore.users.find((u) => u._id === id || u.id === id) || null;
  },

  async create(userData) {
    if (isAtlasConnected()) {
      const doc = new User(userData);
      await doc.save();
      return doc;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    const newRecord = {
      _id: 'usr_' + Date.now() + Math.floor(Math.random() * 1000),
      ...userData,
      password: hashedPassword,
      createdAt: new Date(),
      async comparePassword(p) { return bcrypt.compare(p, this.password); },
      toJSON() {
        const { password, ...safe } = this;
        return { ...safe, id: this._id };
      },
    };
    memStore.users.push(newRecord);
    return newRecord;
  },

  async countDocuments(filter = {}) {
    if (isAtlasConnected()) {
      return User.countDocuments(filter);
    }
    if (filter.role) {
      return memStore.users.filter((u) => u.role === filter.role).length;
    }
    return memStore.users.length;
  },
};

// ----------------- APPLICATIONS -----------------
function calculateAlertForApp(app) {
  if (!app.expiryDate || app.status !== 'Verified') {
    return {
      daysLeft: 0,
      level: app.status === 'Pending' ? 'yellow' : 'red',
      label: app.status,
      color: app.status === 'Pending' ? '#f59e0b' : '#ef4444',
    };
  }
  const now = new Date();
  const diffTime = new Date(app.expiryDate).getTime() - now.getTime();
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) {
    return { daysLeft, level: 'red', label: 'EXPIRED', color: '#ef4444' };
  } else if (daysLeft <= 30) {
    return { daysLeft, level: 'yellow', label: 'RENEWAL DUE', color: '#f59e0b' };
  } else {
    return { daysLeft, level: 'green', label: 'VALID', color: '#10b981' };
  }
}

const applications = {
  async find(filter = {}) {
    if (isAtlasConnected()) {
      return Application.find(filter).sort({ createdAt: -1 });
    }

    let result = memStore.applications;
    if (filter.status) {
      result = result.filter((a) => a.status === filter.status);
    }
    if (filter.$or) {
      result = result.filter((a) =>
        filter.$or.some((sub) => {
          if (sub.userId && a.userId === sub.userId) return true;
          if (sub.ownerName && a.ownerName === sub.ownerName) return true;
          return false;
        })
      );
    }
    return result.map((a) => ({
      ...a,
      toJSON() {
        return { ...a, id: a._id, alert: calculateAlertForApp(a) };
      },
    }));
  },

  async findById(id) {
    if (isAtlasConnected()) {
      return Application.findById(id);
    }
    const item = memStore.applications.find((a) => a._id === id || a.id === id);
    if (!item) return null;
    item.save = async function () { return this; };
    item.calculateAlert = function () { return calculateAlertForApp(this); };
    item.toJSON = function () {
      return { ...this, id: this._id, alert: calculateAlertForApp(this) };
    };
    return item;
  },

  async findOne(filter) {
    if (isAtlasConnected()) {
      return Application.findOne(filter);
    }
    const item = memStore.applications.find((a) => {
      if (filter.certificateId && a.certificateId === filter.certificateId) return true;
      if (filter._id && a._id === filter._id) return true;
      if (filter.$or) {
        return filter.$or.some((sub) => {
          if (sub.certificateId && a.certificateId === sub.certificateId) return true;
          if (sub._id && a._id === sub._id) return true;
          return false;
        });
      }
      return false;
    });
    if (!item) return null;
    return {
      ...item,
      calculateAlert() { return calculateAlertForApp(item); },
      toJSON() {
        return { ...item, id: item._id, alert: calculateAlertForApp(item) };
      },
    };
  },

  async create(appData) {
    if (isAtlasConnected()) {
      const doc = new Application(appData);
      await doc.save();
      return doc;
    }

    const newRecord = {
      _id: 'app_' + Date.now() + Math.floor(Math.random() * 1000),
      ...appData,
      createdAt: new Date(),
      toJSON() {
        return { ...this, id: this._id, alert: calculateAlertForApp(this) };
      },
    };
    memStore.applications.unshift(newRecord);
    return newRecord;
  },

  async countDocuments(filter = {}) {
    if (isAtlasConnected()) {
      return Application.countDocuments(filter);
    }
    let list = memStore.applications;
    if (filter.status) {
      list = list.filter((a) => a.status === filter.status);
    }
    if (filter.expiryDate && filter.expiryDate.$lt) {
      list = list.filter((a) => a.expiryDate && new Date(a.expiryDate) < filter.expiryDate.$lt);
    }
    return list.length;
  },
};

// ----------------- COMPLAINTS -----------------
const complaints = {
  async find(filter = {}) {
    if (isAtlasConnected()) {
      return Complaint.find(filter).sort({ createdAt: -1 });
    }
    let list = memStore.complaints;
    if (filter.status) {
      list = list.filter((c) => c.status === filter.status);
    }
    return list.map((c) => ({
      ...c,
      toJSON() { return { ...c, id: c._id }; },
    }));
  },

  async findById(id) {
    if (isAtlasConnected()) {
      return Complaint.findById(id);
    }
    const item = memStore.complaints.find((c) => c._id === id || c.id === id);
    if (!item) return null;
    item.save = async function () { return this; };
    item.toJSON = function () { return { ...this, id: this._id }; };
    return item;
  },

  async create(cmpData) {
    if (isAtlasConnected()) {
      const doc = new Complaint(cmpData);
      await doc.save();
      return doc;
    }

    const newRecord = {
      _id: 'cmp_' + Date.now() + Math.floor(Math.random() * 1000),
      ...cmpData,
      createdAt: new Date(),
      toJSON() { return { ...this, id: this._id }; },
    };
    memStore.complaints.unshift(newRecord);
    return newRecord;
  },

  async countDocuments(filter = {}) {
    if (isAtlasConnected()) {
      return Complaint.countDocuments(filter);
    }
    return memStore.complaints.length;
  },
};

module.exports = {
  users,
  applications,
  complaints,
  isAtlasConnected,
};
