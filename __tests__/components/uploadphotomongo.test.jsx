import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import UploadPhotoMongo, { extractId } from '../../components/uploadphotomongo'

describe('UploadPhotoMongo (junior dev rewrite)', () => {
beforeEach(() => {

// code so preview image works
global.URL.createObjectURL = jest.fn(() => 'blob:preview')

// setting fetch here so tests don’t complain
global.fetch = jest.fn()


})

it('should show an error if the user selects a file that is not an image', () => {
render(<UploadPhotoMongo />)

const fileInput = document.querySelector('input[type=file]')
const badFile = new File(['hello'], 'notimage.txt', { type: 'text/plain' })

if (fileInput) {
  fireEvent.change(fileInput, { target: { files: [badFile] } })
}

// Expecting the error message to show
expect(screen.getByText('Please select an image file.')).toBeInTheDocument()


})

it('should upload an image and run onChange and onUploading', async () => {
const onChange = jest.fn()
const onUploading = jest.fn()

// mocking successful fetch
global.fetch.mockResolvedValueOnce({
  ok: true,
  json: async () => ({ url: '/api/images/123.jpg' })
})

render(
  <UploadPhotoMongo
    onChange={onChange}
    onUploading={onUploading}
  />
)

const input = document.querySelector('input[type=file]')
const imageFile = new File(['pic'], 'photo.png', {
  type: 'image/png',
  size: 1024
})

if (input) {
  fireEvent.change(input, { target: { files: [imageFile] } })
}

// waiting for upload to finish
await waitFor(() => {
  expect(onChange).toHaveBeenCalledWith('/api/images/123.jpg')
})

// checking if it got called at all
expect(onUploading).toHaveBeenCalled()


})

it('should show a size error if the file is too big (over 8MB)', async () => {
render(<UploadPhotoMongo />)

const fileInput = document.querySelector('input[type=file]')
const tooBig = new File(
  [new ArrayBuffer(9 * 1024 * 1024)], // 9MB
  'big.png',
  { type: 'image/png' }
)

if (fileInput) {
  fireEvent.change(fileInput, { target: { files: [tooBig] } })
}

const errorEl = await screen.findByText('Maximum size is 8MB.')
expect(errorEl).toBeInTheDocument()


})

it('should call onChange(null) and show an error if the upload fails', async () => {
const onChange = jest.fn()

// making fetch fail
global.fetch.mockResolvedValueOnce({
  ok: false,
  json: async () => ({ error: 'server' })
})

render(<UploadPhotoMongo onChange={onChange} />)

const inputFile = document.querySelector('input[type=file]')
const file = new File(['abc'], 'photo.png', {
  type: 'image/png',
  size: 1024
})

if (inputFile) {
  fireEvent.change(inputFile, { target: { files: [file] } })
}

// Should show server error text
await screen.findByText('server')

expect(onChange).toHaveBeenCalledWith(null)


})

it('should pass previousId when the value prop is there', async () => {
let previousIdCaptured = null

global.fetch = jest.fn((url, options) => {
  try {
    const form = options.body
    previousIdCaptured = form.get('previousId')
  } catch (err) {
    // not sure if needed
  }

  return Promise.resolve({
    ok: true,
    json: async () => ({ url: '/api/images/123.jpg' })
  })
})

const onChange = jest.fn()

render(
  <UploadPhotoMongo
    value="https://example.com/api/images/previousId?foo=1"
    onChange={onChange}
  />
)

const input = document.querySelector('input[type=file]')
const img = new File(['img'], 'photo.png', {
  type: 'image/png',
  size: 1024
})

if (input) {
  fireEvent.change(input, { target: { files: [img] } })
}

await waitFor(() => {
  expect(onChange).toHaveBeenCalled()
})

// checking if it got parsed properly
expect(
  previousIdCaptured === 'previousId' || previousIdCaptured === 'previousId'
).toBeTruthy()


})

it('extractId should work with both URLs and plain IDs', () => {
const url = 'https://example.com/api/images/previousId?foo=1'
expect(extractId(url)).toBe('previousId')

const plain = 'previousId'
expect(extractId(plain)).toBe('previousId')


})

it('extractId should still work even if the URL constructor breaks', () => {
const oldURL = global.URL

// making URL throw an error on purpose
global.URL = jest.fn(() => {
  throw new Error('boom')
})

const weird = 'https://example.com/api/images/fallback?id=1'
expect(extractId(weird)).toBe('fallback')

// putting URL back so other tests don’t fail
global.URL = oldURL


})

it('should remove the preview image when clicking remove button', async () => {
const onChange = jest.fn()

render(<UploadPhotoMongo onChange={onChange} />)

// mocking upload success so preview shows
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: async () => ({ url: '/api/images/789.png' })
  })
)

const picker = document.querySelector('input[type=file]')
const img = new File(['bytes'], 'photo.png', {
  type: 'image/png',
  size: 1024
})

if (picker) {
  fireEvent.change(picker, { target: { files: [img] } })
}

const preview = await screen.findByTestId('preview-img')
expect(preview).toBeInTheDocument()

const removeBtn = screen.getByTestId('remove-btn')
fireEvent.click(removeBtn)

expect(onChange).toHaveBeenCalledWith(null)
expect(screen.queryByTestId('preview-img')).toBeNull()


})
})