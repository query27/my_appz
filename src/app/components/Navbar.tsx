import Link from 'next/link'
import Image from 'next/image'
import { createSupabaseServerClient } from '@/app/lib/supabase/server-client'
import AuthButton from './AuthButton'

const Navbar = async () => {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isLoggedIn = !!user

  return (
    <nav className='fixed top-0 w-full flex items-center py-5 border-b border-white/10 bg-[#0a1a14] z-50 px-8'>

      {/* Logo — exactly as original */}
      <Link href="/" className='transition duration-300 hover:scale-110 ml-[152px]'>
        <Image
          src="/navbar_logo.svg"
          alt="Logo"
          width={64}
          height={64}
        />
      </Link>

      {/* This spacer fills ALL the space between logo and the right group */}
      <div className='flex-1' />

      {/* Links + Auth — stuck together on the far right */}
      <div className='flex items-center gap-8'>
        <Link href='/HowItWorks' className='text-gray-300 hover:text-emerald-400 transition-colors text-lg'>
          How It Works
        </Link>
        <Link href='/Pricing' className='text-gray-300 hover:text-emerald-400 transition-colors text-lg'>
          Pricing
        </Link>
        <Link href='/FAQS' className='text-gray-300 hover:text-emerald-400 transition-colors text-lg'>
          FAQs
        </Link>

        <AuthButton isLoggedIn={isLoggedIn} />
      </div>

    </nav>
  )
}

export default Navbar