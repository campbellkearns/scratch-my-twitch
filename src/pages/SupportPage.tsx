import { useEffect } from 'react'

interface PaymentOption {
  name: string
  description: string
  url: string
  icon: string
}

const paymentOptions: PaymentOption[] = [
  {
    name: 'GitHub Sponsors',
    description: 'Support via GitHub',
    url: 'https://github.com/sponsors/campbellkearns',
    icon: '💝'
  },
  {
    name: 'PayPal',
    description: 'Direct donation option',
    url: 'https://paypal.me/',
    icon: '💳'
  }
]

export default function SupportPage(): JSX.Element {
  useEffect(() => {
    // Set page title and meta tags for social sharing
    document.title = 'Support Development - Scratch My Twitch'

    const metaTags = [
      { property: 'og:title', content: 'Support Scratch My Twitch' },
      { property: 'og:description', content: 'Help keep Scratch My Twitch free and open. Support development with a donation.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary' },
      { name: 'twitter:title', content: 'Support Scratch My Twitch' },
      { name: 'twitter:description', content: 'Keep Scratch My Twitch free for everyone' }
    ]

    metaTags.forEach(({ property, name, content }) => {
      let meta = property
        ? document.querySelector(`meta[property="${property}"]`)
        : document.querySelector(`meta[name="${name}"]`)

      if (!meta) {
        meta = document.createElement('meta')
        if (property) {
          meta.setAttribute('property', property)
        } else if (name) {
          meta.setAttribute('name', name)
        }
        document.head.appendChild(meta)
      }
      meta.setAttribute('content', content)
    })

    // Cleanup on unmount
    return () => {
      document.title = 'Scratch My Twitch'
    }
  }, [])

  return (
    <div>
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-medium text-neutral-900 mb-3">
          Support Development
        </h1>
        <p className="text-lg text-neutral-600 mb-4">
          Scratch My Twitch is free and always will be. Your support helps us
          maintain the app, add new features, and keep the community thriving.
        </p>
        <p className="text-lg text-neutral-600">
          Whether it's a one-time donation or monthly support, every contribution
          makes a difference.
        </p>
      </div>

      {/* Why Support Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-medium text-neutral-900 mb-4">
          Your support helps with:
        </h2>
        <ul className="space-y-2 text-neutral-700">
          <li className="flex items-start space-x-2">
            <span className="text-primary">✓</span>
            <span>Maintaining servers and infrastructure</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-primary">✓</span>
            <span>Adding requested features faster</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-primary">✓</span>
            <span>Keeping ads and paywalls away</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-primary">✓</span>
            <span>Supporting open source development</span>
          </li>
        </ul>
      </div>

      {/* Payment Options Grid */}
      <div className="mb-8">
        <h2 className="text-2xl font-medium text-neutral-900 mb-6">
          Choose your platform
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {paymentOptions.map((option) => (
            <div key={option.name} className="scandi-card">
              <div className="flex items-center space-x-3 mb-3">
                <span className="text-3xl">{option.icon}</span>
                <h3 className="text-xl font-medium text-neutral-900">
                  {option.name}
                </h3>
              </div>
              <p className="text-neutral-600 mb-4">
                {option.description}
              </p>
              <a
                href={option.url}
                target="_blank"
                rel="noopener noreferrer"
                className="scandi-btn w-full text-center block"
              >
                Support via {option.name}
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Thank You Section */}
      <div className="text-center py-8">
        <p className="text-lg text-neutral-600">
          Thanks for supporting the future of Scratch My Twitch!
        </p>
        <p className="text-neutral-500 mt-2">
          Together, we're building the best stream management tool for Twitch creators.
        </p>
      </div>
    </div>
  )
}
