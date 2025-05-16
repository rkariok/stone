{\rtf1\ansi\ansicpg1252\cocoartf2822
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 Menlo-Italic;\f1\fnil\fcharset0 Menlo-Regular;}
{\colortbl;\red255\green255\blue255;\red143\green144\blue150;\red255\green255\blue255;\red42\green44\blue51;
\red147\green0\blue147;\red66\green147\blue62;\red167\green87\blue5;\red50\green94\blue238;\red219\green63\blue57;
}
{\*\expandedcolortbl;;\cssrgb\c62745\c63137\c65490;\cssrgb\c100000\c100000\c100000;\cssrgb\c21961\c22745\c25882;
\cssrgb\c65098\c14902\c64314;\cssrgb\c31373\c63137\c30980;\cssrgb\c71765\c41961\c392;\cssrgb\c25098\c47059\c94902;\cssrgb\c89412\c33725\c28627;
}
\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab720
\pard\pardeftab720\partightenfactor0

\f0\i\fs28 \cf2 \cb3 \expnd0\expndtw0\kerning0
// tailwind.config.js
\f1\i0 \cf4 \

\f0\i \cf2 /** \cf5 @type\cf2  \cf4 \{\cf5 import\cf4 (\cf6 'tailwindcss'\cf4 ).\cf7 Config\cf4 \}\cf2  */
\f1\i0 \cf4 \
module.exports \cf8 =\cf4  \{\
  \cf9 content\cf8 :\cf4  [\
    \cf6 "./index.html"\cf4 ,\
    \cf6 "./src/**/*.\{js,ts,jsx,tsx\}"\cf4 ,\
  ],\
  \cf9 theme\cf8 :\cf4  \{\
    \cf9 extend\cf8 :\cf4  \{\
      \cf9 colors\cf8 :\cf4  \{\
        \cf9 'primary'\cf8 :\cf4  \cf6 '#3b82f6'\cf4 ,\
        \cf9 'primary-dark'\cf8 :\cf4  \cf6 '#2563eb'\cf4 ,\
      \},\
      \cf9 fontFamily\cf8 :\cf4  \{\
        \cf9 sans\cf8 :\cf4  [\cf6 'Inter'\cf4 , \cf6 'Segoe UI'\cf4 , \cf6 'system-ui'\cf4 , \cf6 'sans-serif'\cf4 ],\
      \},\
    \},\
  \},\
  \cf9 plugins\cf8 :\cf4  [],\
\}}