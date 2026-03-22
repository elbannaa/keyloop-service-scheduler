import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { ConfigProvider, theme } from 'antd'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: 'hsl(199, 89%, 48%)',
          borderRadius: 8,
          fontFamily: 'DM Sans, sans-serif',
          fontSize: 14,
          fontSizeSM: 12,
          fontSizeHeading1: 28,
          fontSizeHeading2: 22,
          fontSizeHeading3: 18,
          paddingLG: 24,
          paddingMD: 16,
          paddingSM: 12,
          paddingXS: 8,
          controlHeight: 36,
        },
        components: {
          Card: {
            paddingLG: 20,
          },
          Table: {
            padding: 12,
            fontSize: 13,
          },
          Button: {
            controlHeight: 36,
            paddingContentHorizontal: 16,
            fontSize: 14,
          },
          Input: {
            controlHeight: 36,
            fontSize: 14,
          },
          Select: {
            controlHeight: 36,
            fontSize: 14,
          },
        },
        algorithm: theme.defaultAlgorithm,
      }}
    >
      <App />
    </ConfigProvider>
  </StrictMode>,
)
