import { z } from 'zod';

export const EventTypeEnum = z.enum([
  'Wedding',
  'Birthday',
  'Anniversary',
  'Corporate',
  'College Festival',
  'Cultural Program',
  'Fundraiser',
  'Community Gathering',
  'Other',
]);

export const NaturalLanguageIntakeSchema = z.object({
  prompt: z.string().min(10, 'Please provide more details about your event (at least 10 characters).').max(2000),
  preferredCurrency: z.string().default('INR'),
});

export const EventCreateSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.').max(120),
  description: z.string().min(10, 'Description must be at least 10 characters.').max(2000),
  eventType: EventTypeEnum,
  location: z.string().min(2, 'Location is required.').max(100),
  venueName: z.string().optional().nullable(),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()).optional().nullable(),
  guestCount: z.number().int().min(1, 'Guest count must be at least 1.').max(100000),
  budgetTotal: z.number().min(100, 'Budget must be at least 100.'),
  currency: z.string().default('INR'),
  culturalTraditions: z.string().optional().nullable(),
  dietaryRestrictions: z.string().optional().nullable(),
  accessibilityNeeds: z.string().optional().nullable(),
  sustainabilityGoals: z.string().optional().nullable(),
  rainBackupPreference: z.string().optional().nullable(),
});

export const TaskSchema = z.object({
  title: z.string().min(2, 'Task title is required.').max(150),
  description: z.string().max(500).optional().nullable(),
  category: z.string().default('GENERAL'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  status: z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED']).default('TODO'),
  dueDate: z.string().or(z.date()).optional().nullable(),
  assignedTo: z.string().optional().nullable(),
  isCriticalPath: z.boolean().default(false),
  dependsOnTaskId: z.string().optional().nullable(),
});

export const GuestSchema = z.object({
  firstName: z.string().min(1, 'First name is required.').max(50),
  lastName: z.string().min(1, 'Last name is required.').max(50),
  email: z.string().email('Invalid email address.').optional().nullable().or(z.literal('')),
  phone: z.string().max(25).optional().nullable(),
  household: z.string().max(60).optional().nullable(),
  plusOneAllowed: z.boolean().default(false),
  plusOneAttending: z.boolean().default(false),
  dietary: z.string().optional().nullable(),
  accessibility: z.string().optional().nullable(),
  tableId: z.string().optional().nullable(),
  notes: z.string().max(300).optional().nullable(),
});

export const GuestImportRowSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().optional(),
  phone: z.string().optional(),
  household: z.string().optional(),
  dietary: z.string().optional(),
  accessibility: z.string().optional(),
  plusOneAllowed: z.boolean().optional(),
});

export const VendorSchema = z.object({
  name: z.string().min(2, 'Vendor name is required.').max(100),
  category: z.string().min(2, 'Category is required.'),
  contactName: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal('')),
  phone: z.string().max(25).optional().nullable(),
  website: z.string().url().optional().nullable().or(z.literal('')),
  address: z.string().optional().nullable(),
  rating: z.number().min(1).max(5).default(4.8),
  status: z.enum(['DISCOVERED', 'CONTACTED', 'QUOTED', 'SHORTLISTED', 'BOOKED', 'DECLINED']).default('DISCOVERED'),
  notes: z.string().max(500).optional().nullable(),
});

export const ExpenseSchema = z.object({
  categoryId: z.string(),
  name: z.string().min(2, 'Expense name is required.').max(100),
  estimatedCost: z.number().min(0),
  actualCost: z.number().min(0).default(0),
  paidAmount: z.number().min(0).default(0),
  dueDate: z.string().or(z.date()).optional().nullable(),
  paymentStatus: z.enum(['UNPAID', 'PARTIAL', 'PAID']).default('UNPAID'),
  notes: z.string().optional().nullable(),
});

export const ScenarioSimulationSchema = z.object({
  scenarioType: z.enum([
    'BUDGET_CUT_20',
    'GUEST_INCREASE_30',
    'VENDOR_CANCELLATION',
    'RAIN_WEATHER_ALERT',
    'DELAYED_DELIVERIES',
    'EVENT_DATE_SHIFT',
    'VENUE_CAPACITY_REDUCED',
  ]),
  notes: z.string().optional(),
});

export const CopilotQuerySchema = z.object({
  message: z.string().min(2, 'Question must not be empty.').max(1000),
  conversationId: z.string().optional(),
});
