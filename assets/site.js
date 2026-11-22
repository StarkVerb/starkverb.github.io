document.querySelectorAll('[data-quiz]').forEach(quiz => {
  const options = [...quiz.querySelectorAll('.option')];
  const feedback = quiz.querySelector('.quiz-feedback');
  options.forEach(option => {
    option.addEventListener('click', () => {
      const correct = option.dataset.correct === 'true';
      options.forEach(item => {
        item.setAttribute('aria-pressed', String(item === option));
        delete item.dataset.state;
      });
      option.dataset.state = correct ? 'correct' : 'wrong';
      feedback.textContent = correct
        ? `Верно! ${feedback.dataset.explanation}`
        : `Пока неверно. ${feedback.dataset.explanation}`;
    });
  });
});
