import glob
import string

csv_files = glob.glob('LoanStats*.csv')
print 'Will merge the following files:'
print csv_files

merged_file = open('merged_loan_data.csv', 'a')

current_file = open(csv_files[0])
lines = current_file.readlines()

for line in lines[:-2]:
	if 'Loans that do not meet the credit policy' in line:
		print 'It does many, many things...'
	else:
		line = str.replace(line, '%', '')
		line = str.replace(line, ' months', '')
		merged_file.write(line)
current_file.close()

for filename in csv_files[1:]:
	current_file = open(filename)
	lines = current_file.readlines()
	for line in lines[1:-2]:
		line = str.replace(line, '%', '')
		line = str.replace(line, ' months', '')
		merged_file.write(line)
	current_file.close()
merged_file.close()

print 'Merged file: merged_loan_data.csv'