
import React from 'react';
import { Category } from './types';

export const CATEGORIES: Category[] = ['Cliente', 'Amigo', 'Familiar', 'Trabalho', 'Outros'];

export const CATEGORY_COLORS: Record<Category, string> = {
  'Cliente': 'bg-blue-100 text-blue-800',
  'Amigo': 'bg-emerald-100 text-emerald-800',
  'Familiar': 'bg-purple-100 text-purple-800',
  'Trabalho': 'bg-orange-100 text-orange-800',
  'Outros': 'bg-gray-100 text-gray-800',
};
