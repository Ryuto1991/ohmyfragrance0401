import { Provider } from '@supabase/supabase-js'

export const providers = [
  {
    id: 'google',
    name: 'Google',
    provider: 'google' as Provider,
    icon: 'google',
    color: 'bg-white hover:bg-gray-50',
    textColor: 'text-gray-900',
    borderColor: 'border-gray-300',
  },
  {
    id: 'twitter',
    name: 'X',
    provider: 'twitter' as Provider,
    icon: 'twitter',
    color: 'bg-black hover:bg-black/90',
    textColor: 'text-white',
    borderColor: 'border-transparent',
  },
] as const

export type SocialProvider = typeof providers[number] 