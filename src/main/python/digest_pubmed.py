
filepath = "/Users/sdery/Downloads/articles.A-B/Accid_Anal_Prev/Accid_Anal_Prev_2011_May_43(3)_1062-1067.nxml"

# Create local output directory if necessary
output_folder = '/Users/sdery/Desktop/pubmed_digest/'
if not os.path.isdir(output_folder):
	os.mkdir(output_folder)

# 
vertex_file_path = output_folder + 'vertex.json';
vertex_file = open(vertex_file_path, 'w')

root = xmlfiletobs(filepath)
if not root == None:
	# Journal and date
	article_id = ""
	bs_entry = root.find(name='article-id', attrs={'pub-id-type': 'pmid'})
	if bs_entry == None:
		article_id = bs_entry.text

	"""
	find_attrb =   [['article_id', 'pub-id-type', 'doi'],
					['journal-id', 'journal-id-type', 'iso-abbrev'],
					['article-title'],
					['contrib', 'contrib-type', 'author'],
					['aff'],
					['date', 'date-type', 'accepted']]

	for attrb in find_attrb:
		value = ""
		if len(attrb) == 1:
			bs_entry = root.find(name=attrb[0])
		elif len(attrb) == 3:
			bs_entry = root.find(name=attrb[0], attrs={attrb[1]: attrb[2]})
		value = bs_entry.text
	"""

	article_doi = ""
	bs_entry = root.find(name='article-id', attrs={'pub-id-type': 'doi'})
	if bs_entry == None:
		article_doi = bs_entry.text

	journal_id = ""
	bs_entry = root.find(name='journal-id', attrs={'journal-id-type': 'iso-abbrev'})
	if bs_entry == None:
		article_doi = bs_entry.text

	article_title = ""
	bs_article_title = root.find(name='article-title')
	if bs_entry == None:
		article-title = bs_entry.text

	authors = ""
	bs_authors = root.findAll(name='contrib', attrs={'contrib-type': 'author'})
	if bs_entry == None:
		authors = bs_entry.text

	affiliations = ""
	bs_affiliations = root.findAll(name='aff')
	if bs_entry == None:
		affiliations = bs_entry.text

	date_accepted = ""
	bs_date_accepted = root.find(name='date', attrs={'date-type': 'accepted'})
	if bs_entry == None:
		date_accepted = bs_entry.text


