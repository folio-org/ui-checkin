@Library ('folio_jenkins_shared_libs@FOLIO-1763') _

buildNPM {
  publishModDescriptor = 'yes'
  runLint = 'yes'
  runSonarqube = true
  runTest = 'yes'
  runTestOptions = '--karma.singleRun --karma.browsers ChromeDocker --karma.reporters mocha junit --coverage'
}
