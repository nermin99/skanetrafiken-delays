import { Amplify } from 'aws-amplify'
import amplifyOutputs from '../amplify_outputs.json'

// Side-effect import: must run before any module that calls generateClient(),
// which otherwise touches the Amplify singleton before it's configured.
Amplify.configure(amplifyOutputs)
