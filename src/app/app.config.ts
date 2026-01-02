import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideAnimations } from '@angular/platform-browser/animations';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';

import { routes } from './app.routes';

const firebaseConfig = {
  apiKey: "AIzaSyCbJvq0JJoitm0Enh-y4kE419C4nG9LLaE",
  authDomain: "gym-exercise-tracker-624a8.firebaseapp.com",
  projectId: "gym-exercise-tracker-624a8",
  storageBucket: "gym-exercise-tracker-624a8.firebasestorage.app",
  messagingSenderId: "105352205454",
  appId: "1:105352205454:web:399cb1412b91e8da0f25df",
  measurementId: "G-84Y7YQ3ZF7"
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    provideAnimations(),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideFirestore(() => getFirestore())
  ]
};
