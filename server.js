const path = require('path');
const jsonServer = require('json-server');

const server = jsonServer.create();
const router = jsonServer.router('server/db.json');
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

// ========== AUTENTICACIÓN ==========
server.post('/api/v1/authentication/sign-up', (req, res) => {
  const newUser = req.body;
  const db = router.db;
  const existing = db.get('users').find({ username: newUser.username }).value();

  if (existing) {
    return res.status(400).json({ error: 'Username already exists' });
  }

  const id = db.get('users').value().length + 1;
  const user = { id, ...newUser };

  db.get('users').push(user).write();

  res.status(201).json({
    id: user.id,
    username: user.username,
    email: user.email,
    userType: user.userType,
  });
});

server.post('/api/v1/authentication/sign-in', (req, res) => {
  const { username, password } = req.body;
  const db = router.db;
  const user = db.get('users').find({ username, password }).value();

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = 'fake-jwt-token-' + user.id;

  res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    userType: user.userType,
    token,
  });
});

server.get('/api/v1/users/me', (req, res) => {
  const auth = req.headers.authorization;

  if (!auth) return res.status(401).json({ error: 'No token' });

  const token = auth.split(' ')[1];
  const userId = token.split('-').pop();
  const db = router.db;
  const user = db.get('users').find({ id: parseInt(userId) }).value();

  if (!user) return res.status(404).json({ error: 'User not found' });

  res.json(user);
});

// ========== USERS ==========
server.get('/api/v1/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const db = router.db;
  const user = db.get('users').find({ id }).value();

  if (!user) return res.status(404).json({ error: 'User not found' });

  const { password, ...profile } = user;
  res.json(profile);
});

server.patch('/api/v1/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const updates = req.body;
  const db = router.db;
  const index = db.get('users').findIndex({ id }).value();

  if (index === -1) return res.status(404).json({ error: 'User not found' });

  const current = db.get('users').value()[index];
  const allowedUpdates = { ...updates };

  delete allowedUpdates.username;
  delete allowedUpdates.password;
  delete allowedUpdates.userType;

  const updated = { ...current, ...allowedUpdates };

  db.get('users').splice(index, 1, updated).write();

  const { password, ...profile } = updated;
  res.json(profile);
});

server.post('/api/v1/users/change-password', (req, res) => {
  const { userId, currentPassword, newPassword } = req.body;
  const db = router.db;
  const user = db.get('users').find({ id: userId }).value();

  if (!user) return res.status(404).json({ error: 'User not found' });

  if (user.password !== currentPassword) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }

  db.get('users').find({ id: userId }).assign({ password: newPassword }).write();

  res.json({ message: 'Password updated successfully' });
});

// ========== PETS ==========
server.get('/api/v1/pets', (req, res) => {
  const ownerId = parseInt(req.query.ownerId);
  const db = router.db;
  let pets = db.get('pets').value();

  if (ownerId) pets = pets.filter(pet => pet.ownerId === ownerId);

  res.json(pets);
});

server.get('/api/v1/pets/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const db = router.db;
  const pet = db.get('pets').find({ id }).value();

  if (!pet) return res.status(404).json({ error: 'Pet not found' });

  res.json(pet);
});

server.post('/api/v1/pets', (req, res) => {
  const newPet = req.body;
  const db = router.db;
  const id = db.get('pets').value().length + 1;
  const pet = { id, ...newPet };

  db.get('pets').push(pet).write();

  res.status(201).json(pet);
});

server.put('/api/v1/pets/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const updates = req.body;
  const db = router.db;
  const index = db.get('pets').findIndex({ id }).value();

  if (index === -1) return res.status(404).json({ error: 'Pet not found' });

  const updated = { ...db.get('pets').value()[index], ...updates, id };

  db.get('pets').splice(index, 1, updated).write();

  res.json(updated);
});

server.delete('/api/v1/pets/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const db = router.db;
  const index = db.get('pets').findIndex({ id }).value();

  if (index === -1) return res.status(404).json({ error: 'Pet not found' });

  db.get('pets').splice(index, 1).write();

  res.status(204).send();
});

// ========== APPOINTMENTS PARA OWNER Y CLINIC ==========
server.get('/api/v1/appointments', (req, res) => {
  const ownerId = parseInt(req.query.ownerId);
  const clinicId = parseInt(req.query.clinicId);
  const db = router.db;
  let appointments = db.get('appointments').value();

  if (ownerId) {
    const pets = db.get('pets').filter(p => p.ownerId === ownerId).value();
    const petIds = pets.map(p => p.id);
    appointments = appointments.filter(a => petIds.includes(a.petId));
  }

  if (clinicId) {
    appointments = appointments.filter(a => a.clinicId === clinicId);
  }

  res.json(appointments);
});

// ========== DISPONIBILIDAD PARA CLÍNICAS ==========
server.get('/api/v1/clinics/:id/available-slots', (req, res) => {
  const clinicId = parseInt(req.params.id);
  const date = req.query.date;

  if (!date) return res.status(400).json({ error: 'Date parameter required' });

  const db = router.db;
  const clinic = db.get('clinics').find({ id: clinicId }).value();

  if (!clinic) return res.status(404).json({ error: 'Clinic not found' });

  const dayOfWeek = new Date(date).toLocaleDateString('en', { weekday: 'long' });

  let startHour = 8;
  let endHour = 20;

  if (dayOfWeek === 'Saturday') {
    startHour = 9;
    endHour = 14;
  }

  if (dayOfWeek === 'Sunday') return res.json([]);

  const slots = [];

  for (let hour = startHour; hour < endHour; hour++) {
    const startTime = `${hour.toString().padStart(2, '0')}:00`;
    const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
    slots.push({ startTime, endTime });
  }

  const startOfDay = new Date(`${date}T00:00:00`);
  const endOfDay = new Date(`${date}T23:59:59`);

  const appointments = db.get('appointments')
    .filter(a => a.clinicId === clinicId && a.status !== 'cancelled')
    .value();

  const occupiedSlots = appointments
    .filter(a => {
      const appDate = new Date(a.dateTime);
      return appDate >= startOfDay && appDate <= endOfDay;
    })
    .map(a => {
      const hour = new Date(a.dateTime).getHours();
      return `${hour.toString().padStart(2, '0')}:00`;
    });

  const availableSlots = slots.filter(slot => !occupiedSlots.includes(slot.startTime));

  res.json(availableSlots);
});

// ========== DISPONIBILIDAD PARA PROFESIONALES MÓVILES ==========
server.get('/api/v1/mobile-professionals/:id/available-slots', (req, res) => {
  const mobileId = parseInt(req.params.id);
  const date = req.query.date;

  if (!date) return res.status(400).json({ error: 'Date parameter required' });

  const db = router.db;

  const availability = db.get('mobileAvailability')
    .filter(a => a.mobileId === mobileId && a.date === date)
    .value();

  if (!availability.length) return res.json([]);

  const startOfDay = new Date(`${date}T00:00:00`);
  const endOfDay = new Date(`${date}T23:59:59`);

  const acceptedRequests = db.get('mobileRequests')
    .filter(r => r.mobileId === mobileId && r.status === 'accepted')
    .value();

  const occupiedSlots = acceptedRequests
    .filter(r => {
      const reqDate = new Date(r.scheduledDateTime);
      return reqDate >= startOfDay && reqDate <= endOfDay;
    })
    .map(r => {
      const hour = new Date(r.scheduledDateTime).getHours();
      return `${hour.toString().padStart(2, '0')}:00`;
    });

  const availableSlots = [];

  availability.forEach(block => {
    const startHour = parseInt(block.startTime.split(':')[0]);
    const endHour = parseInt(block.endTime.split(':')[0]);

    for (let hour = startHour; hour < endHour; hour++) {
      const startTime = `${hour.toString().padStart(2, '0')}:00`;

      if (!occupiedSlots.includes(startTime)) {
        availableSlots.push({
          startTime,
          endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
        });
      }
    }
  });

  res.json(availableSlots);
});

// ========== APPOINTMENTS ==========
server.post('/api/v1/appointments', (req, res) => {
  const newApp = req.body;
  const db = router.db;

  if (!newApp || !newApp.dateTime) {
    return res.status(400).json({ error: 'Invalid appointment payload' });
  }

  if (!newApp.providerType) {
    return res.status(400).json({ error: 'providerType is required' });
  }

  const clinicId = newApp.clinicId !== undefined ? parseInt(newApp.clinicId) : undefined;
  const petId = newApp.petId !== undefined ? parseInt(newApp.petId) : undefined;
  const providerId = newApp.providerId !== undefined ? parseInt(newApp.providerId) : undefined;

  if (petId !== undefined) {
    const pet = db.get('pets').find({ id: petId }).value();
    if (!pet) return res.status(404).json({ error: 'Pet not found' });
  }

  const dateTime = new Date(newApp.dateTime);

  if (isNaN(dateTime.getTime())) {
    return res.status(400).json({ error: 'Invalid dateTime' });
  }

  const dateStr = dateTime.toISOString().split('T')[0];
  const hour = dateTime.getHours();

  let finalClinicId = clinicId;

  if (newApp.providerType === 'clinic') {
    const resolvedClinicId = clinicId !== undefined && !isNaN(clinicId)
      ? clinicId
      : providerId !== undefined && !isNaN(providerId)
        ? providerId
        : undefined;

    if (resolvedClinicId === undefined) {
      return res.status(400).json({ error: 'clinicId or providerId is required for clinic appointments' });
    }

    const clinic = db.get('clinics').find({ id: resolvedClinicId }).value();

    if (!clinic) return res.status(404).json({ error: 'Clinic not found' });

    finalClinicId = resolvedClinicId;

    const dayOfWeek = new Date(dateStr).toLocaleDateString('en', { weekday: 'long' });

    let startHour = 8;
    let endHour = 20;

    if (dayOfWeek === 'Saturday') {
      startHour = 9;
      endHour = 14;
    }

    if (dayOfWeek === 'Sunday') {
      return res.status(400).json({ error: 'Clinic closed on Sunday' });
    }

    const appointments = db.get('appointments')
      .filter(a => parseInt(a.clinicId) === resolvedClinicId && a.status !== 'cancelled')
      .value();

    const occupiedByClinic = appointments.some(a => {
      const aDate = new Date(a.dateTime);
      return aDate.toISOString().split('T')[0] === dateStr && aDate.getHours() === hour;
    });

    if (occupiedByClinic) {
      return res.status(409).json({ error: 'Time slot already taken' });
    }

    if (newApp.veterinarianId) {
      const vetId = parseInt(newApp.veterinarianId);

      if (!isNaN(vetId)) {
        const vetAppointments = db.get('appointments')
          .filter(a => parseInt(a.veterinarianId) === vetId && a.status !== 'cancelled')
          .value();

        const occupiedByVet = vetAppointments.some(a => {
          const aDate = new Date(a.dateTime);
          return aDate.toISOString().split('T')[0] === dateStr && aDate.getHours() === hour;
        });

        if (occupiedByVet) {
          return res.status(409).json({ error: 'Veterinarian not available at this time' });
        }
      }
    }
  } else if (newApp.providerType === 'mobile') {
    if (providerId === undefined || isNaN(providerId)) {
      return res.status(400).json({ error: 'providerId is required for mobile appointments' });
    }

    const availability = db.get('mobileAvailability')
      .filter(a => a.mobileId === providerId && a.date === dateStr)
      .value();

    const withinAvailability = availability.some(block => {
      const start = parseInt(block.startTime.split(':')[0]);
      const end = parseInt(block.endTime.split(':')[0]);
      return hour >= start && hour < end;
    });

    if (!withinAvailability) {
      return res.status(400).json({ error: 'Outside working hours' });
    }

    const accepted = db.get('mobileRequests')
      .filter(r => r.mobileId === providerId && r.status === 'accepted')
      .value();

    const occupied = accepted.some(r => {
      const rDate = new Date(r.scheduledDateTime);
      return rDate.toISOString().split('T')[0] === dateStr && rDate.getHours() === hour;
    });

    if (occupied) {
      return res.status(409).json({ error: 'Time slot already taken' });
    }

    newApp._createMobileRequest = true;
  } else {
    return res.status(400).json({ error: 'Unknown providerType' });
  }

  const id = db.get('appointments').value().length + 1;

  const appointment = {
    id,
    ...newApp,
    clinicId: typeof finalClinicId !== 'undefined' && finalClinicId !== null
      ? finalClinicId
      : clinicId !== undefined
        ? clinicId
        : providerId !== undefined
          ? providerId
          : newApp.clinicId,
    providerId: providerId !== undefined ? providerId : newApp.providerId,
    petId: petId !== undefined ? petId : newApp.petId,
    createdAt: new Date().toISOString(),
  };

  db.get('appointments').push(appointment).write();

  if (newApp.providerType === 'mobile' && newApp._createMobileRequest) {
    const mobileReqId = db.get('mobileRequests').value().length + 1;

    const mobileRequest = {
      id: mobileReqId,
      mobileId: providerId !== undefined ? providerId : newApp.providerId || null,
      ownerId: newApp.ownerId !== undefined ? newApp.ownerId : null,
      petId: petId !== undefined ? petId : newApp.petId || null,
      serviceId: newApp.serviceId !== undefined ? newApp.serviceId : null,
      status: 'pending',
      scheduledDateTime: newApp.dateTime,
      address: newApp.address || '',
      notes: newApp.notes || '',
      createdAt: new Date().toISOString(),
    };

    db.get('mobileRequests').push(mobileRequest).write();
  }

  res.status(201).json(appointment);
});

server.put('/api/v1/appointments/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const updates = req.body;
  const db = router.db;
  const index = db.get('appointments').findIndex({ id }).value();

  if (index === -1) return res.status(404).json({ error: 'Appointment not found' });

  const updated = { ...db.get('appointments').value()[index], ...updates, id };

  db.get('appointments').splice(index, 1, updated).write();

  res.json(updated);
});

server.delete('/api/v1/appointments/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const db = router.db;
  const index = db.get('appointments').findIndex({ id }).value();

  if (index === -1) return res.status(404).json({ error: 'Appointment not found' });

  db.get('appointments').splice(index, 1).write();

  res.status(204).send();
});

// ========== CLINICS ==========
server.get('/api/v1/clinics/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const db = router.db;
  const clinic = db.get('clinics').find({ id }).value();

  if (!clinic) return res.status(404).json({ error: 'Clinic not found' });

  res.json(clinic);
});

server.patch('/api/v1/clinics/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const updates = req.body;
  const db = router.db;
  const index = db.get('clinics').findIndex({ id }).value();

  if (index === -1) return res.status(404).json({ error: 'Clinic not found' });

  const current = db.get('clinics').value()[index];

  delete updates.id;

  const updated = { ...current, ...updates };

  db.get('clinics').splice(index, 1, updated).write();

  res.json(updated);
});

// ========== VETERINARIANS ==========
server.get('/api/v1/veterinarians', (req, res) => {
  const clinicId = parseInt(req.query.clinicId);
  const db = router.db;
  let vets = db.get('veterinarians').value();

  if (clinicId) vets = vets.filter(v => v.clinicId === clinicId);

  res.json(vets);
});

server.get('/api/v1/veterinarians/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const db = router.db;
  const vet = db.get('veterinarians').find({ id }).value();

  if (!vet) return res.status(404).json({ error: 'Veterinarian not found' });

  res.json(vet);
});

server.post('/api/v1/veterinarians', (req, res) => {
  const newVet = req.body;
  const db = router.db;
  const id = db.get('veterinarians').value().length + 1;
  const vet = { id, ...newVet };

  db.get('veterinarians').push(vet).write();

  res.status(201).json(vet);
});

server.put('/api/v1/veterinarians/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const updates = req.body;
  const db = router.db;
  const index = db.get('veterinarians').findIndex({ id }).value();

  if (index === -1) return res.status(404).json({ error: 'Veterinarian not found' });

  const updated = { ...db.get('veterinarians').value()[index], ...updates, id };

  db.get('veterinarians').splice(index, 1, updated).write();

  res.json(updated);
});

server.delete('/api/v1/veterinarians/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const db = router.db;
  const index = db.get('veterinarians').findIndex({ id }).value();

  if (index === -1) return res.status(404).json({ error: 'Veterinarian not found' });

  db.get('veterinarians').splice(index, 1).write();

  res.status(204).send();
});

// ========== SERVICES ==========
server.get('/api/v1/services', (req, res) => {
  const clinicId = parseInt(req.query.clinicId);
  const db = router.db;
  let services = db.get('services').value();

  if (clinicId) services = services.filter(s => s.clinicId === clinicId);

  res.json(services);
});

server.get('/api/v1/services/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const db = router.db;
  const service = db.get('services').find({ id }).value();

  if (!service) return res.status(404).json({ error: 'Service not found' });

  res.json(service);
});

server.post('/api/v1/services', (req, res) => {
  const newService = req.body;
  const db = router.db;
  const id = db.get('services').value().length + 1;
  const service = { id, ...newService };

  db.get('services').push(service).write();

  res.status(201).json(service);
});

server.put('/api/v1/services/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const updates = req.body;
  const db = router.db;
  const index = db.get('services').findIndex({ id }).value();

  if (index === -1) return res.status(404).json({ error: 'Service not found' });

  const updated = { ...db.get('services').value()[index], ...updates, id };

  db.get('services').splice(index, 1, updated).write();

  res.json(updated);
});

server.delete('/api/v1/services/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const db = router.db;
  const index = db.get('services').findIndex({ id }).value();

  if (index === -1) return res.status(404).json({ error: 'Service not found' });

  db.get('services').splice(index, 1).write();

  res.status(204).send();
});

// ========== PATIENTS ==========
server.get('/api/v1/patients', (req, res) => {
  const clinicId = parseInt(req.query.clinicId);
  const db = router.db;
  let patients = db.get('patients').value();

  if (clinicId) patients = patients.filter(p => p.clinicId === clinicId);

  res.json(patients);
});

server.get('/api/v1/patients/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const db = router.db;
  const patient = db.get('patients').find({ id }).value();

  if (!patient) return res.status(404).json({ error: 'Patient not found' });

  res.json(patient);
});

// ========== MEDICAL RECORDS ==========
server.get('/api/v1/medical-records', (req, res) => {
  const petId = parseInt(req.query.petId);
  const db = router.db;
  let records = db.get('medicalRecords').value();

  if (petId) records = records.filter(r => r.petId === petId);

  res.json(records);
});

server.post('/api/v1/medical-records', (req, res) => {
  const newRecord = req.body;
  const db = router.db;
  const id = db.get('medicalRecords').value().length + 1;
  const record = { id, ...newRecord, date: newRecord.date || new Date().toISOString() };

  db.get('medicalRecords').push(record).write();

  res.status(201).json(record);
});

// ========== SERVICE PROVIDERS ==========
server.get('/api/v1/service-providers', (req, res) => {
  const db = router.db;
  const clinics = db.get('clinics').value().map(c => ({ ...c, type: 'clinic' }));
  const mobilePros = db.get('mobileProfessionals').value().map(m => ({ ...m, type: 'mobile' }));

  let all = [...clinics, ...mobilePros];

  if (req.query.district) all = all.filter(p => p.district === req.query.district);
  if (req.query.specialty) all = all.filter(p => p.specialties?.includes(req.query.specialty));
  if (req.query.type) all = all.filter(p => p.type === req.query.type);

  res.json(all);
});

// ========== ALERTS ==========
server.get('/api/v1/alerts', (req, res) => {
  res.json([]);
});

// ========== MOBILE PROFESSIONALS ==========
server.get('/api/v1/mobile-professionals', (req, res) => {
  const db = router.db;
  let pros = db.get('mobileProfessionals').value();

  if (req.query.userId) pros = pros.filter(p => p.userId === parseInt(req.query.userId));

  res.json(pros);
});

server.get('/api/v1/mobile-professionals/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const db = router.db;
  const pro = db.get('mobileProfessionals').find({ id }).value();

  if (!pro) return res.status(404).json({ error: 'Mobile professional not found' });

  res.json(pro);
});

server.post('/api/v1/mobile-professionals', (req, res) => {
  const newPro = req.body;
  const db = router.db;
  const id = db.get('mobileProfessionals').value().length + 1;
  const pro = { id, ...newPro };

  db.get('mobileProfessionals').push(pro).write();

  res.status(201).json(pro);
});

server.put('/api/v1/mobile-professionals/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const updates = req.body;
  const db = router.db;
  const index = db.get('mobileProfessionals').findIndex({ id }).value();

  if (index === -1) return res.status(404).json({ error: 'Mobile professional not found' });

  const updated = { ...db.get('mobileProfessionals').value()[index], ...updates, id };

  db.get('mobileProfessionals').splice(index, 1, updated).write();

  res.json(updated);
});

server.delete('/api/v1/mobile-professionals/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const db = router.db;
  const index = db.get('mobileProfessionals').findIndex({ id }).value();

  if (index === -1) return res.status(404).json({ error: 'Mobile professional not found' });

  db.get('mobileProfessionals').splice(index, 1).write();

  res.status(204).send();
});

// ========== MOBILE SERVICES ==========
server.get('/api/v1/mobile-services', (req, res) => {
  const mobileId = parseInt(req.query.mobileId);
  const db = router.db;
  let services = db.get('mobileServices').value();

  if (mobileId) services = services.filter(s => s.mobileId === mobileId);

  res.json(services);
});

server.get('/api/v1/mobile-services/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const db = router.db;
  const service = db.get('mobileServices').find({ id }).value();

  if (!service) return res.status(404).json({ error: 'Mobile service not found' });

  res.json(service);
});

server.post('/api/v1/mobile-services', (req, res) => {
  const newService = req.body;
  const db = router.db;
  const id = db.get('mobileServices').value().length + 1;
  const service = { id, ...newService };

  db.get('mobileServices').push(service).write();

  res.status(201).json(service);
});

server.put('/api/v1/mobile-services/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const updates = req.body;
  const db = router.db;
  const index = db.get('mobileServices').findIndex({ id }).value();

  if (index === -1) return res.status(404).json({ error: 'Mobile service not found' });

  const updated = { ...db.get('mobileServices').value()[index], ...updates, id };

  db.get('mobileServices').splice(index, 1, updated).write();

  res.json(updated);
});

server.delete('/api/v1/mobile-services/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const db = router.db;
  const index = db.get('mobileServices').findIndex({ id }).value();

  if (index === -1) return res.status(404).json({ error: 'Mobile service not found' });

  db.get('mobileServices').splice(index, 1).write();

  res.status(204).send();
});

// ========== MOBILE AVAILABILITY ==========
server.get('/api/v1/mobile-availability', (req, res) => {
  const mobileId = parseInt(req.query.mobileId);
  const date = req.query.date;
  const db = router.db;
  let slots = db.get('mobileAvailability').value();

  if (mobileId) slots = slots.filter(s => s.mobileId === mobileId);
  if (date) slots = slots.filter(s => s.date === date);

  res.json(slots);
});

server.get('/api/v1/mobile-availability/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const db = router.db;
  const slot = db.get('mobileAvailability').find({ id }).value();

  if (!slot) return res.status(404).json({ error: 'Availability slot not found' });

  res.json(slot);
});

server.post('/api/v1/mobile-availability', (req, res) => {
  const newSlot = req.body;
  const db = router.db;
  const id = db.get('mobileAvailability').value().length + 1;
  const slot = { id, ...newSlot };

  db.get('mobileAvailability').push(slot).write();

  res.status(201).json(slot);
});

server.put('/api/v1/mobile-availability/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const updates = req.body;
  const db = router.db;
  const index = db.get('mobileAvailability').findIndex({ id }).value();

  if (index === -1) return res.status(404).json({ error: 'Availability slot not found' });

  const updated = { ...db.get('mobileAvailability').value()[index], ...updates, id };

  db.get('mobileAvailability').splice(index, 1, updated).write();

  res.json(updated);
});

server.delete('/api/v1/mobile-availability/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const db = router.db;
  const index = db.get('mobileAvailability').findIndex({ id }).value();

  if (index === -1) return res.status(404).json({ error: 'Availability slot not found' });

  db.get('mobileAvailability').splice(index, 1).write();

  res.status(204).send();
});

// ========== MOBILE REQUESTS ==========
server.get('/api/v1/mobile-requests', (req, res) => {
  const mobileId = parseInt(req.query.mobileId);
  const db = router.db;
  let requests = db.get('mobileRequests').value();

  if (mobileId) requests = requests.filter(r => r.mobileId === mobileId);

  res.json(requests);
});

server.get('/api/v1/mobile-requests/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const db = router.db;
  const request = db.get('mobileRequests').find({ id }).value();

  if (!request) return res.status(404).json({ error: 'Request not found' });

  res.json(request);
});

server.post('/api/v1/mobile-requests', (req, res) => {
  const newRequest = req.body;
  const db = router.db;
  const id = db.get('mobileRequests').value().length + 1;
  const request = { id, ...newRequest, createdAt: new Date().toISOString() };

  db.get('mobileRequests').push(request).write();

  res.status(201).json(request);
});

server.put('/api/v1/mobile-requests/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const updates = req.body;
  const db = router.db;
  const index = db.get('mobileRequests').findIndex({ id }).value();

  if (index === -1) return res.status(404).json({ error: 'Request not found' });

  const updated = { ...db.get('mobileRequests').value()[index], ...updates, id };

  db.get('mobileRequests').splice(index, 1, updated).write();

  res.json(updated);
});

server.delete('/api/v1/mobile-requests/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const db = router.db;
  const index = db.get('mobileRequests').findIndex({ id }).value();

  if (index === -1) return res.status(404).json({ error: 'Request not found' });

  db.get('mobileRequests').splice(index, 1).write();

  res.status(204).send();
});

// ========== MOBILE APPOINTMENTS ==========
server.get('/api/v1/mobile-appointments', (req, res) => {
  const mobileId = parseInt(req.query.mobileId);
  const db = router.db;
  let appointments = db.get('mobileAppointments').value();

  if (mobileId) appointments = appointments.filter(a => a.mobileId === mobileId);

  res.json(appointments);
});

server.get('/api/v1/mobile-appointments/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const db = router.db;
  const appointment = db.get('mobileAppointments').find({ id }).value();

  if (!appointment) return res.status(404).json({ error: 'Appointment not found' });

  res.json(appointment);
});

server.post('/api/v1/mobile-appointments', (req, res) => {
  const newAppointment = req.body;
  const db = router.db;
  const id = db.get('mobileAppointments').value().length + 1;
  const appointment = { id, ...newAppointment };

  db.get('mobileAppointments').push(appointment).write();

  res.status(201).json(appointment);
});

server.put('/api/v1/mobile-appointments/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const updates = req.body;
  const db = router.db;
  const index = db.get('mobileAppointments').findIndex({ id }).value();

  if (index === -1) return res.status(404).json({ error: 'Appointment not found' });

  const updated = { ...db.get('mobileAppointments').value()[index], ...updates, id };

  db.get('mobileAppointments').splice(index, 1, updated).write();

  res.json(updated);
});

server.delete('/api/v1/mobile-appointments/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const db = router.db;
  const index = db.get('mobileAppointments').findIndex({ id }).value();

  if (index === -1) return res.status(404).json({ error: 'Appointment not found' });

  db.get('mobileAppointments').splice(index, 1).write();

  res.status(204).send();
});

// ========== ROUTER POR DEFECTO ==========
server.use('/api/v1', router);

// ========== SERVIR ANGULAR EN PRODUCCIÓN ==========
const distPath = path.join(__dirname, 'dist', 'PetCare-Frontend', 'browser');

server.use(jsonServer.defaults({
  static: distPath,
}));

server.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`✅ PetCare frontend and mock API running on port ${PORT}`);
});
