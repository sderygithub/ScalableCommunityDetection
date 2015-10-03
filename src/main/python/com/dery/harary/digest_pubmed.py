
filepath = "/Users/sdery/Downloads/articles.A-B/Accid_Anal_Prev/Accid_Anal_Prev_2011_May_43(3)_1062-1067.nxml"

# Create local output directory if necessary
output_folder = './'

# Track affiliation per country
countries_filepath = './countries.txt'
countries_file = open(countries_filepath, 'r')
countries = [c.lower() for c in countries_file.read().split('\n')]
countries.append('unknown')
countries_file.close()

delimiter = '\t'
output_file_path = output_folder + 'pubmed.tsv';
output_file = open(output_file_path,'a')
wr = csv.writer(output_file, delimiter=delimiter, quoting=csv.QUOTE_ALL)

coauthors_file = open(output_folder + 'coauthors.tsv', 'a')
coauthors_wr = csv.writer(coauthors_file, delimiter=delimiter, quoting=csv.QUOTE_ALL)

publication_file = open(output_folder + 'publication.tsv', 'a')
publication_wr = csv.writer(publication_file, delimiter=delimiter, quoting=csv.QUOTE_ALL)

visited = 0
completed = 0

rootpath = './articles/'
dirlist = [ f for f in listdir(rootpath) if isdir(join(rootpath,f)) ]
for dirname in dirlist:
	
	# Stopwatch for manual validation
	if visited > 100000:
		break;
	
	print "SD> INFO: Folder " + dirname
	# 
	journalpath = rootpath + dirname + '/'
	filelist = [ f for f in listdir(journalpath) if isfile(join(journalpath,f)) ]
	for filename in filelist:

		line = journalpath + filename

		visited = visited + 1

		print "SD> INFO:   File " + str(visited) + " :" + line

		line = line.strip()

		root = xmlfiletobs(line)
		if root == None:
			continue;

		try:
			# Article DOI
			bs_entry = root.find(name='article-id', attrs={'pub-id-type': 'doi'})
			doi = getstr(bs_entry);

			# Journal iso-abbrev
			bs_entry = root.find(name='journal-id', attrs={'journal-id-type': 'iso-abbrev'})
			journal_id = getstr(bs_entry);

			# Article Title
			bs_entry = root.find(name='article-title')
			article_title = getstr(bs_entry);

			# Article Title
			bs_entry = root.find(name='abstract')
			abstract = getstr(bs_entry);

			# Keywords
			bs_entry = root.findAll(name='kwd')
			if bs_entry != None:
				keywords = [unidecode(entry.text) for entry in bs_entry]

			# Authors
			authors = []
			bs_entry = root.findAll(name='contrib', attrs={'contrib-type': 'author'})
			if bs_entry != None:
				for entry in bs_entry:
					name = getstr(entry,'name').lower()
					surname = getstr(entry,'surname')
					givenname = getstr(entry,'givenname')
					if givenname == None:
						givenname = getstr(entry,'given-names')
					authors.append([name, surname, givenname])

			# Affiliations
			# @TODO: Reorder countries per relevance to speed the search
			affiliations = []
			bs_entry = root.findAll(name='aff')
			if bs_entry != None:
				for entry in bs_entry:
					sentence = unidecode(entry.text).lower()
					for country in countries:
						if country in sentence:
							affiliations.append(country)
							break;

			bs_entry = root.find(name='date', attrs={'date-type': 'accepted'})
			if bs_entry == None: continue
			day = getint(bs_entry,'day')
			month = getint(bs_entry,'month')
			year = getint(bs_entry,'year')
			date_accepted = [day, month, year]

			bsentry = root.find(name='date', attrs={'date-type': 'received'})
			if bsentry == None: continue
			day = getint(bsentry,'day')
			month = getint(bsentry,'month')
			year = getint(bsentry,'year')
			date_received = [day, month, year]

			bsentry = root.find(name='ref-list')
			if bsentry == None: continue
			entries = bsentry.findAll(name='pub-id', attrs={'pub-id-type':'doi'})
			references = [unidecode(pmid.text) for pmid in entries]
			
			# Build coauthorship network
			for a in authors:
				coauthors_wr.writerow([a[2],a[1],date_accepted])
				coauthors_wr.writerow([a[1],a[2],date_accepted])

			for r in references:
				publication_wr.writerow([doi,r,date_accepted])

			row = [doi,journal_id,article_title,abstract,authors,affiliations,date_accepted,date_received,references]
			wr.writerow(row)
			
			# Update count
			completed = completed + 1

		except:
			print "SD> WARN: Oops. Some error poppped up.."

output_file.close()
coauthors_wr.close()
publication_wr.close()

print "Visited: " + str(visited)
print "Completed: " + str(completed)

