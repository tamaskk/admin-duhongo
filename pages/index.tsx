import Main from '@/components/main';
import { SessionProvider, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react'

const index = () => {

  return (
    <SessionProvider>
      <Main />
    </SessionProvider>
  )
}

export default index