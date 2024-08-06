import { Button } from './Button';

type FooterProps = {
  onNext: () => void;
  onBack: () => void;
  backDisabled?: boolean;
  nextDisabled?: boolean;
  showBack?: boolean;
  nextLabel?: string;
  backLabel?: string;
};

export function Footer(props: FooterProps) {
  return (
    <div className='bg-[#222739] absolute bottom-0 p-5 w-full flex gap-2 flex-row justify-between text-white'>
      <Button
        disabled={props.backDisabled}
        type='button'
        hidden={props.showBack}
        label={props.backLabel || 'Retake'}
        onClick={props.onBack}
        className='border-white !text-white'
      />
      <Button
        disabled={props.nextDisabled}
        type='button'
        label={props.nextLabel || 'Use this one'}
        onClick={props.onNext}
        className='bg-[#E60000] !text-white border-[#E60000] flex-1 md:flex-none'
      />
    </div>
  );
}
