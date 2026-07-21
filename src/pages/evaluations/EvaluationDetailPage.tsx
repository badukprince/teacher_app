import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAppData } from '../../store/AppDataContext';
import { EvaluationResultView } from '../../components/EvaluationResultView';
import { overallScore } from '../../lib/evaluationConfig';
import { ArrowLeftIcon, PencilIcon, PrinterIcon, TrashIcon } from '../../components/icons';

export function EvaluationDetailPage() {
  const { studentId, evaluationId } = useParams();
  const { getStudent, getEvaluation, getEvaluationsForStudent, deleteEvaluation } = useAppData();
  const navigate = useNavigate();

  const student = studentId ? getStudent(studentId) : undefined;
  const evaluation = evaluationId ? getEvaluation(evaluationId) : undefined;

  if (!student || !evaluation || evaluation.studentId !== student.id) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
        <p className="text-sm font-medium text-slate-700">평가 기록을 찾을 수 없어요</p>
        <Link to="/evaluations" className="mt-3 text-sm font-medium text-brand-600 hover:text-brand-700">
          평가 대상 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  const history = getEvaluationsForStudent(student.id);
  const index = history.findIndex((e) => e.id === evaluation.id);
  const previous = index > 0 ? history[index - 1] : null;
  const score = overallScore(evaluation);

  const handleDelete = () => {
    if (window.confirm(`${evaluation.date} 평가 기록을 삭제할까요?`)) {
      deleteEvaluation(evaluation.id);
      navigate(`/evaluations/${student.id}`);
    }
  };

  return (
    <div>
      <Link
        to={`/evaluations/${student.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 print:hidden"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        평가 이력
      </Link>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between print:mt-0">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 md:text-2xl print:text-lg">{student.name} · {evaluation.date} 평가</h1>
          {score !== null && <p className="mt-1 text-sm text-slate-500 print:text-xs">종합 점수 {score}점</p>}
        </div>
        <div className="flex shrink-0 gap-2 print:hidden">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <PrinterIcon className="h-4 w-4" />
            인쇄
          </button>
          <Link
            to={`/evaluations/${student.id}/${evaluation.id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <PencilIcon className="h-4 w-4" />
            수정
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <TrashIcon className="h-4 w-4" />
            삭제
          </button>
        </div>
      </div>

      <div className="mt-5 print:mt-2">
        <EvaluationResultView evaluation={evaluation} previous={previous} />
      </div>
    </div>
  );
}
