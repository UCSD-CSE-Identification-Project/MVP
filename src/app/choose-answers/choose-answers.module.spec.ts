import { ChooseAnswersModule } from './choose-answers.module';

describe('ChooseAnswersModule', () => {
  let chooseAnswersModule: ChooseAnswersModule;

  beforeEach(() => {
    chooseAnswersModule = new ChooseAnswersModule();
  });

  it('should create an instance', () => {
    expect(chooseAnswersModule).toBeTruthy();
  });
});
