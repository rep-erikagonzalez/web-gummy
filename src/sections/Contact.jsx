import { useState } from 'react'
import { config, contact } from '../data/content'
import SectionDecor from './Decor'
import { FRUITS } from './fruits'
import Reveal from './Reveal'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function fieldErrors(values) {
  const errors = {}
  if (!values.name.trim()) errors.name = contact.errors.name
  if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = contact.errors.email
  if (!values.topic) errors.topic = contact.errors.topic
  if (values.message.trim().length < 8) errors.message = contact.errors.message
  return errors
}

function mailtoHref(values) {
  const subject = `Hola Erika — ${values.topic}`
  const body = `Nombre: ${values.name.trim()}\nCorreo: ${values.email.trim()}\nTema: ${values.topic}\n\n${values.message.trim()}`
  return `mailto:${config.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

async function copyText(value) {
  try {
    await navigator.clipboard.writeText(value)
    return true
  } catch {
    const input = document.createElement('textarea')
    input.value = value
    input.setAttribute('readonly', '')
    input.style.position = 'fixed'
    input.style.left = '-9999px'
    document.body.appendChild(input)
    input.select()
    const ok = document.execCommand('copy')
    input.remove()
    return ok
  }
}

export default function Contact() {
  const [values, setValues] = useState({ name: '', email: '', topic: '', message: '', gotcha: '' })
  const [touched, setTouched] = useState({})
  const [attempted, setAttempted] = useState(false)
  const [status, setStatus] = useState('idle')
  const [copied, setCopied] = useState('')
  const errors = fieldErrors(values)
  const Drop = FRUITS.berry

  const update = (key) => (event) => {
    setValues((current) => ({ ...current, [key]: event.target.value }))
  }

  const touch = (key) => () => setTouched((current) => ({ ...current, [key]: true }))

  const visibleError = (key) => ((touched[key] || attempted) && errors[key]) || ''

  const copyEmail = async () => {
    const ok = await copyText(config.email)
    setCopied(ok ? 'ok' : 'fail')
    window.setTimeout(() => setCopied(''), 1600)
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    setAttempted(true)
    if (Object.keys(errors).length > 0) return
    if (values.gotcha.trim()) {
      setStatus('sent')
      return
    }

    if (!config.formspreeId) {
      const link = document.createElement('a')
      link.href = mailtoHref(values)
      link.click()
      return
    }

    setStatus('sending')
    try {
      const response = await fetch(`https://formspree.io/f/${config.formspreeId}`, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          topic: values.topic,
          message: values.message.trim(),
          _replyto: values.email.trim(),
        }),
      })
      if (!response.ok) throw new Error('form')
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section className="band band-alt" id="contacto" aria-labelledby="contacto-title">
      <SectionDecor
        items={[
          { fruit: 'star', place: 'tl' },
          { fruit: 'bloom', place: 'tr' },
          { fruit: 'pear', place: 'br' },
        ]}
      />
      <div className="band-inner">
        <Reveal>
          <h2 className="talk-title" id="contacto-title">
            {contact.title}
          </h2>
          <p className="talk-lead">{contact.text}</p>
          <div className="contact-grid">
            <div className="contact-facts">
              <p>
                <button type="button" className="copy-mail" onClick={copyEmail}>
                  {config.email}
                </button>
              </p>
              {copied ? (
                <p className={`copied${copied === 'ok' ? ' is-wobble' : ''}`} role="status">
                  {copied === 'ok' ? contact.copied : contact.copyFail}
                </p>
              ) : null}
              <p>{config.location}</p>
              {config.linkedin ? (
                <p>
                  <a href={config.linkedin} target="_blank" rel="noreferrer">
                    {contact.social.linkedin}
                  </a>
                </p>
              ) : null}
              {config.github ? (
                <p>
                  <a href={config.github} target="_blank" rel="noreferrer">
                    {contact.social.github}
                  </a>
                </p>
              ) : null}
            </div>

            <div className="form-card">
              {status === 'sent' ? (
                <div className="form-success" role="status">
                  <Drop className="drop-fruit" decorative />
                  <p>{contact.success}</p>
                </div>
              ) : (
                <form className="contact-form" noValidate onSubmit={onSubmit}>
                  <label className="honeypot" aria-hidden="true">
                    {contact.honeypot}
                    <input
                      type="text"
                      name="_gotcha"
                      tabIndex={-1}
                      autoComplete="off"
                      value={values.gotcha}
                      onChange={update('gotcha')}
                    />
                  </label>
                  <label className="field">
                    <span>{contact.fields.name}</span>
                    <input
                      name="name"
                      autoComplete="name"
                      value={values.name}
                      aria-invalid={visibleError('name') ? true : undefined}
                      aria-describedby={visibleError('name') ? 'error-name' : undefined}
                      onBlur={touch('name')}
                      onChange={update('name')}
                    />
                    {visibleError('name') ? (
                      <small id="error-name" className="field-error">
                        {visibleError('name')}
                      </small>
                    ) : null}
                  </label>
                  <label className="field">
                    <span>{contact.fields.email}</span>
                    <input
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={values.email}
                      aria-invalid={visibleError('email') ? true : undefined}
                      aria-describedby={visibleError('email') ? 'error-email' : undefined}
                      onBlur={touch('email')}
                      onChange={update('email')}
                    />
                    {visibleError('email') ? (
                      <small id="error-email" className="field-error">
                        {visibleError('email')}
                      </small>
                    ) : null}
                  </label>
                  <fieldset className="topic-field">
                    <legend id="topic-label">{contact.topicLabel}</legend>
                    <div className="topic-row" role="group" aria-labelledby="topic-label">
                      {contact.topics.map((topic) => (
                        <button
                          key={topic}
                          type="button"
                          className="topic-pill"
                          aria-pressed={values.topic === topic}
                          onClick={() => {
                            setValues((current) => ({ ...current, topic }))
                            setTouched((current) => ({ ...current, topic: true }))
                          }}
                        >
                          {topic}
                        </button>
                      ))}
                    </div>
                    {visibleError('topic') ? <small className="field-error">{visibleError('topic')}</small> : null}
                  </fieldset>
                  <label className="field">
                    <span>{contact.fields.message}</span>
                    <textarea
                      name="message"
                      rows={5}
                      value={values.message}
                      aria-invalid={visibleError('message') ? true : undefined}
                      aria-describedby={visibleError('message') ? 'error-message' : undefined}
                      onBlur={touch('message')}
                      onChange={update('message')}
                    />
                    {visibleError('message') ? (
                      <small id="error-message" className="field-error">
                        {visibleError('message')}
                      </small>
                    ) : null}
                  </label>
                  {status === 'error' ? (
                    <p className="form-error" role="alert">
                      {contact.error} <a href={mailtoHref(values)}>{config.email}</a>
                    </p>
                  ) : null}
                  <button className="btn btn-primary" type="submit" disabled={status === 'sending'}>
                    {status === 'sending' ? contact.sending : contact.submit}
                  </button>
                </form>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
