import { useResposiveScale } from '@/lib/resposive';
import React from 'react';
import { CText } from './text';

const ErrorLable = ({err_msg} : {err_msg?: string}) => {
  const { rpm, rf } = useResposiveScale();
  if(!err_msg) return null;
  
  return (
    <CText className='font-regular'
      style={{
        fontSize: rf(13),
        marginStart: rpm(1),
        marginTop: rpm(1),
        color: "red"
      }}
    >
      {err_msg}
    </CText>
  )
}

export default ErrorLable