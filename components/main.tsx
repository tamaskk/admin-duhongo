import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react'

const Main = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session) {
      router.push('/login')
    } else {
      router.push('/dashboard')
    }
  }, [session, status])

  return (
    <div>index</div>
  )
}

export default Main