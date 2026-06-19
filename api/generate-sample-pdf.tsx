/**
 * One-off script — generates a sample onboarding PDF for design review.
 * Run with:  npx tsx --tsconfig api/tsconfig.json api/generate-sample-pdf.tsx
 * Output:    scripts/sample-onboarding.pdf
 */
import * as React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { OnboardingPDF } from './pdf/OnboardingPDF';

const samplePayload = {
  sessionId: 'albie_1716681234_x7f3k2',
  propertyType: 'independent',

  general: {
    propertyName: 'The Grand Pavilion Hotel',
    description:
      'A boutique five-star property nestled in the heart of Copenhagen, offering contemporary Danish design, Michelin-starred dining, and panoramic harbour views.',
    address: 'Bredgade 34',
    city: 'Copenhagen',
    stateProvince: 'Capital Region',
    country: 'Denmark',
    zipCode: '1260',
    timezone: 'Europe/Copenhagen',
    currency: 'DKK',
    language: 'English',
    phone: '+45 33 12 77 00',
    notificationEmail: 'reservations@grandpavilion.dk',
    websiteUrl: 'https://www.grandpavilion.dk',
  },

  brand: {
    siteTitle: 'The Grand Pavilion · Official Booking',
    primaryColor: '#12433F',
    secondaryColor: '#dfec60',
    accentColor: '#2F6B6D',
    fontFamily: 'Playfair Display',
    buttonStyle: 'Rounded',
    logoUrl: 'https://www.grandpavilion.dk/assets/logo.svg',
    faviconUrl: 'https://www.grandpavilion.dk/favicon.ico',
  },

  dns: {
    subdomain: 'book.grandpavilion.dk',
    gtmId: 'GTM-XXXXXXX',
    ga4Id: 'G-XXXXXXXXXX',
    mapId: '',
  },

  cancellationPolicies: [
    {
      id: 1,
      name: 'Flexible',
      description: 'Full refund if cancelled more than 48 hours before arrival.',
      window: 48,
      penaltyType: 'No charge',
      penaltyValue: '',
      notes: 'Applies to all standard rates',
      isDefault: true,
    },
    {
      id: 2,
      name: 'Non-Refundable',
      description: 'No refund. Discounted rate — full charge applies on booking.',
      window: 0,
      penaltyType: 'Full stay',
      penaltyValue: '100',
      notes: 'Only applicable to Early Bird and Advance Purchase rate plans',
      isDefault: false,
    },
    {
      id: 3,
      name: 'Moderate',
      description: 'Full refund if cancelled at least 7 days prior to arrival. 50% penalty within 7 days.',
      window: 168,
      penaltyType: 'Percentage',
      penaltyValue: '50',
      notes: '',
      isDefault: false,
    },
  ],

  rooms: [
    {
      id: 1,
      code: 'STD-DLX',
      shortTitle: 'Deluxe Room',
      longTitle: 'Deluxe Harbour-View Room',
      type: 'Standard',
      bed: 'King',
      bedrooms: 1,
      description: 'Elegantly appointed room with floor-to-ceiling windows and direct views over the Nyhavn canal.',
      maxOccupants: 2,
      maxAdults: 2,
      childrenCapacity: 1,
      includedOccupancy: 2,
      facilities: ['Air conditioning', 'Mini bar', 'Safe', 'Rain shower', 'Nespresso machine', 'Smart TV'],
      imageUrls: [
        'https://www.grandpavilion.dk/rooms/deluxe-1.jpg',
        'https://www.grandpavilion.dk/rooms/deluxe-2.jpg',
      ],
    },
    {
      id: 2,
      code: 'JR-STE',
      shortTitle: 'Junior Suite',
      longTitle: 'Junior Suite with Separate Lounge',
      type: 'Suite',
      bed: 'King',
      bedrooms: 1,
      description: 'Expansive suite with a separate lounge, butler pantry, and private terrace overlooking the courtyard garden.',
      maxOccupants: 3,
      maxAdults: 2,
      childrenCapacity: 2,
      includedOccupancy: 2,
      facilities: ['Air conditioning', 'Mini bar', 'Safe', 'Walk-in shower', 'Bathtub', 'Smart TV', 'Espresso machine', 'Private terrace'],
      imageUrls: ['https://www.grandpavilion.dk/rooms/junior-suite-1.jpg'],
    },
    {
      id: 3,
      code: 'PH',
      shortTitle: 'Penthouse Suite',
      longTitle: 'Royal Penthouse Suite',
      type: 'Penthouse',
      bed: 'King',
      bedrooms: 2,
      description: "The crown jewel of the hotel — two bedrooms, a grand salon, private chef's kitchen, and rooftop terrace with panoramic views.",
      maxOccupants: 4,
      maxAdults: 4,
      childrenCapacity: 2,
      includedOccupancy: 2,
      facilities: ['Air conditioning', 'Full kitchen', 'Private terrace', 'Jacuzzi', 'Smart TV', 'Dedicated butler', 'Private dining room'],
      imageUrls: [
        'https://www.grandpavilion.dk/rooms/penthouse-1.jpg',
        'https://www.grandpavilion.dk/rooms/penthouse-2.jpg',
      ],
    },
  ],

  addons: {
    breakfast: { enabled: true, price: '38' },
    airportTransfer: { enabled: true, price: '120' },
    parking: { enabled: true, price: '28' },
    lateCheckout: { enabled: true, price: '' },
    earlyCheckin: { enabled: false, price: '' },
    cityCycling: { enabled: true, price: '15' },
    romanticPackage: { enabled: true, price: '145' },
  },

  rates: {
    rateCode: 'BAR',
    rateGroup: 'Retail',
    shortTitle: 'Best Available Rate',
    longTitle: 'Best Available Rate — Book Direct & Save',
    status: 'Active',
    availFrom: '2024-01-01',
    availTo: '2026-12-31',
    minStay: '1',
    maxStay: '14',
    imageUrl: 'https://www.grandpavilion.dk/rates/bar-hero.jpg',
    tags: 'direct, flexible, breakfast-optional',
    salesMessages: 'Book directly for our best price guarantee and complimentary room upgrade on arrival, subject to availability.',
    terms: 'Rate is per room per night. Cancellation policy applies. Prices include VAT.',
  },

  taxes: [
    {
      id: 1,
      name: 'Danish VAT',
      type: 'Tax',
      description: 'Standard Danish value-added tax on accommodation',
      chargeType: 'Percentage',
      value: '25',
      quantifier: 'Per booking',
    },
    {
      id: 2,
      name: 'Copenhagen City Tax',
      type: 'Fee',
      description: 'Municipality tourism levy — mandatory for all overnight stays',
      chargeType: 'Fixed',
      value: '20',
      quantifier: 'Per person per night',
    },
    {
      id: 3,
      name: 'Resort Service Charge',
      type: 'Fee',
      description: 'Covers access to spa facilities, fitness centre, and concierge services',
      chargeType: 'Fixed',
      value: '15',
      quantifier: 'Per room per night',
    },
  ],
};

(async () => {
  console.log('Rendering PDF...');
  const buffer = await renderToBuffer(
    React.createElement(OnboardingPDF, { payload: samplePayload }) as any,
  );
  mkdirSync(join(__dirname, '..', 'scripts'), { recursive: true });
  const outPath = join(__dirname, '..', 'scripts', 'sample-onboarding.pdf');
  writeFileSync(outPath, buffer);
  console.log('Saved to ' + outPath);
})();
