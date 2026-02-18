import Link from 'next/link'
import Image from 'next/image'
import { createSupabaseServerClient } from '@/app/lib/supabase/server-client'
import AuthButton from './AuthButton'

const Navbar = async () => {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isLoggedIn = !!user

  return (
    <nav className='fixed top-0 w-full flex items-center justify-around py-5 border-b border-black bg-white z-50'>

      <Link href="/" className='transition duration-300 hover:scale-110'>
        <Image
          src="/navbar_logo.svg"
          alt="Logo"
          width={64}
          height={64}
        />
      </Link>

      <ul className='flex gap-10 text-lg'>
        <Link href='/Features' className='text-black hover:text-blue-500 transition-colors'>
          Features
        </Link>
        <Link href='/Docs' className='text-black hover:text-blue-500 transition-colors'>
          Docs
        </Link>
        <Link href='/Pricing' className='text-black hover:text-blue-500 transition-colors'>
          Pricing
        </Link>
      </ul>

      <AuthButton isLoggedIn={isLoggedIn} />

    </nav>
  )
}

export default Navbar